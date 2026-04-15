package com.nt.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nt.entity.User;

import java.util.List;

public interface IUserRepository  extends JpaRepository<User,Integer>{
       public User findByEmail(String username);

       public User findByUserName(String username);
       List<User> findByIsActive(boolean isActive);

       public Boolean existsByUserName(String userName);
}
