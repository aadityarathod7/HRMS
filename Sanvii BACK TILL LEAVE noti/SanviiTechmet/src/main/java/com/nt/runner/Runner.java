package com.nt.runner;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;

import com.nt.Impl.IRoleService;

//@Component
public class Runner  implements CommandLineRunner{

	@Autowired
	private IRoleService roleService;
	@Override
	public void run(String... args) throws Exception {
	/*	Roles role = new Roles("ROLE_USER");
		roleService.addRole(role);
		*/
	}

}
