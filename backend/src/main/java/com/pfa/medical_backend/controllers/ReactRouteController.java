package com.pfa.medical_backend.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class ReactRouteController {
    @GetMapping(value = "/{path:[^\\.]*}")
    public String forward(@PathVariable String path) {
        return "forward:/index.html";
    }
}