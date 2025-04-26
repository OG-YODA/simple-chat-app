package com.example.demo.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.domain.UserIP;

public interface UserIpRepo extends JpaRepository<UserIP, String>{
	
}
