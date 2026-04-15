package com.nt.jwt;

import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import com.nt.service.CustomUserDetails;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwt;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

	
	private final SecretKey keys = Keys.hmacShaKeyFor("afdocmnftydsfdwtabcksdkiiiiiiiiiiiiiiiskfklsdfksdjfkjsd".getBytes());

	  public String generateToken(Authentication authentication) {
	 CustomUserDetails details = 
		  (CustomUserDetails) authentication.getPrincipal();
	 System.out.println(details.getUsername());
	 List<String> roles = details.getAuthorities().stream()
             .map(GrantedAuthority::getAuthority)
             .collect(Collectors.toList());
		
	 return Jwts.builder()
				  .subject(details.getUsername())
				  .claim("id", details.getUsername())
				  .claim("roles", roles)
				  .issuedAt(new Date(System.currentTimeMillis()))
				  .expiration(new Date(System.currentTimeMillis()+30*60*60*1000))
				  .signWith(keys)
				  .compact();		  
	  }
	  
	  public String extractusername(String token) {
		  Claims claims = Jwts.parser()
				       .verifyWith(keys)
				       .build()
				       .parseSignedClaims(token)
				       .getPayload();
		  return claims.getSubject();
	  }

		private Set<String> blacklist = new HashSet<>();
		public void blacklistToken(String token) {
			blacklist.add(token);
		}

		public boolean isTokenBlacklisted(String token) {
			return blacklist.contains(token);
		}
	  public Boolean validateToken(String token) {
		  if (isTokenBlacklisted(token)) {
			  return false;
		  }
			try {
				Jwts.parser()
				.verifyWith(keys)
				.build()
				.parseSignedClaims(token);
				return true;
			} catch (Exception e) {
				return false;
			}
	  }
}
