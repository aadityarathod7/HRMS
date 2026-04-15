package com.nt.exceptionHandler;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class CommonGlobalExceptionHandler {

    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<String> handleNullPointerException(NullPointerException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

//    @ExceptionHandler
//    public ResponseEntity<String> departmentNotFoundException(DepartmentNotFoundException e)
//    {
//        return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
//    }
}

