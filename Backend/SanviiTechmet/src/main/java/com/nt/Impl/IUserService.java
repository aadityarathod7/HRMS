package com.nt.Impl;

import java.util.List;

import com.nt.dto.UserDto;
import com.nt.entity.User;
import com.nt.request.CreateUserRequest;

public interface IUserService {
   
	 public User addUser(CreateUserRequest user);
	 public List<UserDto> getallusers();
	List<UserDto> getUsersByActiveStatus(boolean isActive);

	void deactivateUser(Integer userId);

	boolean updateUser(Integer id, CreateUserRequest createUserRequest);

	void activateUser(Integer userId);

	public UserDto getUserById(Integer id) throws Exception;
}
