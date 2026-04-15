package com.nt.service;

import java.sql.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import com.nt.Impl.IUserService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.nt.dto.UserDto;
import com.nt.entity.Roles;
import com.nt.entity.User;
import com.nt.repository.IRoleRepository;
import com.nt.repository.IUserRepository;
import com.nt.request.CreateUserRequest;


@Service
public class UserServiceimpl implements IUserService {
    @Autowired
    private IRoleRepository roleRepository;
    @Autowired
    private IUserRepository userRepository;
    @Autowired
    private PasswordEncoder encoder;
    @Autowired
    private ModelMapper mapper;

    public User addUser(CreateUserRequest request) {
        Set<Roles> userRoles = new HashSet<>();
        for (String roleName : request.getRoles()) {
            Roles role = roleRepository.findByRole(roleName);
            if (role != null) {
                userRoles.add(role);
            } else {
                userRoles.add(null);
                   }
        }

        User user = new User();
        user.setFirstname(request.getFirstname());
        user.setLastname(request.getLastname());
        user.setDob(request.getDob());
        user.setContactNumber(request.getContactNumber());
        user.setEmail(request.getEmail());
        user.setUserName(request.getUserName());
        user.setPassword(encoder.encode(request.getPassword()));
        user.setBranch(request.getBranch());
        user.setBloodGroup(request.getBloodGroup());
        user.setDateOfJoining(request.getDateOfJoining());
        user.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        user.setAddress(request.getAddress());
        user.setGender(request.getGender());
        user.setRoles(userRoles);

        // Set the createdBy and createdDate as the current authenticated user and date
        String currentUserName = SecurityContextHolder.getContext().getAuthentication().getName();
        user.setCreatedBy(currentUserName);
        user.setCreatedDate(Date.valueOf(new Date(System.currentTimeMillis()).toLocalDate()));

        // For updatedBy and updatedDate, you can set them as null or leave them as is since the user is just being created
        user.setUpdatedBy(null);
        user.setUpdatedDate(null);

        return userRepository.save(user);
    }


    @Override
    public void deactivateUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        user.setIsActive(false);
        user.setUpdatedDate(new Date(System.currentTimeMillis()));
        userRepository.save(user);
    }

    @Override
    public void activateUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        user.setIsActive(true);
        user.setUpdatedDate(new Date(System.currentTimeMillis()));
        userRepository.save(user);
    }

    @Override
    public List<UserDto> getUsersByActiveStatus(boolean isActive) {
        return getconverted(userRepository.findByIsActive(isActive));
    }

    @Override
    public boolean updateUser(Integer id, CreateUserRequest createUserRequest) {
        Optional<User> optionalUser = userRepository.findById(id);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            user.setFirstname(createUserRequest.getFirstname());
            user.setLastname(createUserRequest.getLastname());
            user.setDob(createUserRequest.getDob());
            user.setContactNumber(createUserRequest.getContactNumber());
            user.setEmail(createUserRequest.getEmail());
            user.setBranch(createUserRequest.getBranch());
            user.setBloodGroup(createUserRequest.getBloodGroup());
            user.setDateOfJoining(createUserRequest.getDateOfJoining());
            user.setIsActive(createUserRequest.getIsActive());
            user.setUpdatedDate(new Date(System.currentTimeMillis()));
            user.setAddress(createUserRequest.getAddress());
            user.setUserName(createUserRequest.getUserName());
            user.setGender(createUserRequest.getGender());
            String currentUserName = SecurityContextHolder.getContext().getAuthentication().getName();
            user.setCreatedBy(user.getCreatedBy());
            user.setCreatedDate(user.getCreatedDate());
            user.setUpdatedBy(currentUserName);
            user.setUpdatedDate(Date.valueOf(new Date(System.currentTimeMillis()).toLocalDate()));
            Set<Roles> userRoles = new HashSet<>();
            for (String roleName : createUserRequest.getRoles()) {
                Roles role = roleRepository.findByRole(roleName);
                if (role != null) {
                    userRoles.add(role);
                } else {
                    throw new RuntimeException("Role not found: " + roleName);
                }
            }
            user.setRoles(userRoles);

            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Override
    public UserDto getUserById(Integer id) throws Exception {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new Exception("User not found with ID: " + id));
        return convertodto(user);
    }


    @Override
    public List<UserDto> getallusers() {
        return getconverted(userRepository.findAll());
    }

    public UserDto convertodto(User user) {
        return mapper.map(user, UserDto.class);
    }

    public List<UserDto> getconverted(List<User> users) {
        return users.stream().map(this::convertodto).toList();
    }


}
