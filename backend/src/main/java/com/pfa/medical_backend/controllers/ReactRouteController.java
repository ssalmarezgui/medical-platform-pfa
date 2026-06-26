package com.pfa.medical_backend.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ReactRouteController {

    // Redirige toutes les URL de navigation frontend (qui ne contiennent pas de point ".") vers index.html
    @RequestMapping(value = "/{path:[^\\.]*}")
    public String forward() {
        return "forward:/index.html";
    }
}