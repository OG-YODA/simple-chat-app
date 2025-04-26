package com.example.demo.repo;

import com.example.demo.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findById(String id);
    Optional<User> findByUsername(String username);
    @Query("SELECT u FROM User u WHERE u.username LIKE %:username%")
    List<User> findAllByUsernameContaining(@Param("username") String username);

    @Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(u.firstname) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(u.lastname) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<User> findByUsernameOrFirstNameOrLastName(@Param("query") String query);

    @Query("SELECT u FROM User u WHERE LOWER(u.firstname) = LOWER(:firstname) " +
           "AND LOWER(u.lastname) = LOWER(:lastname)")
    List<User> findByFullName(@Param("firstname") String firstname, @Param("lastname") String lastname);


}