package com.nt.controller;

import com.nt.dto.UserDto;
import com.nt.repository.IUserRepository;
import com.nt.request.CreateUserRequest;
import com.nt.Impl.IUserService;
import com.nt.service.RoleMenuActionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private IUserService userService;

    @Autowired
    private RoleMenuActionService roleMenuActionService;

    @Autowired
    private IUserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<String> registeruser(@RequestBody CreateUserRequest createUserRequest){
        if( userRepository.existsByUserName(createUserRequest.getUserName())) {
            return new ResponseEntity<>("User already exists with Username "+createUserRequest.getUserName(),
                    HttpStatus.CONFLICT) ;
        }
        Object user = userService.addUser(createUserRequest);
        return new ResponseEntity<String>("User Created", HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserDto>> getAllUserApi(@RequestParam(required = false) Boolean isActive) {
        List<UserDto> userDtos;

        if (isActive == null) {
            userDtos = userService.getallusers();
        } else {
            userDtos = userService.getUsersByActiveStatus(isActive);
        }

        return new ResponseEntity<>(userDtos, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Integer id) {
        try {
            UserDto userDto = userService.getUserById(id);
            return new ResponseEntity<>(userDto, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }


    @PutMapping("/deactivate/{userId}")
    public ResponseEntity<String> deactivateUser(@PathVariable Integer userId) {
        userService.deactivateUser(userId);
        return new ResponseEntity<>("User deactivated successfully", HttpStatus.OK);
    }

    @PutMapping("/activate/{userId}")
    public ResponseEntity<String> activateUser(@PathVariable Integer userId) {
        userService.activateUser(userId);
        return new ResponseEntity<>("User activated successfully", HttpStatus.OK);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateUser(@PathVariable Integer id, @RequestBody CreateUserRequest createUserRequest) {
        boolean isUpdated = userService.updateUser(id, createUserRequest);
        if (isUpdated) {
            return new ResponseEntity<>("User updated successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/check")
    public boolean checkPermission(
            @RequestParam("roleId") Integer roleId,
            @RequestParam("menuItemId") Integer menuItemId,
            @RequestParam("menuActionId") Integer menuActionId
    ) {
        return roleMenuActionService.hasPermission(roleId, menuItemId, menuActionId);
    }
}
