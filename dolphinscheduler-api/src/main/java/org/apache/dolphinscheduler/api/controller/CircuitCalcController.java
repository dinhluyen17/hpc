package org.apache.dolphinscheduler.api.controller;

import org.apache.dolphinscheduler.api.service.CircuitCalcService;
import org.apache.dolphinscheduler.api.utils.CircuitClass;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/circuit-calc")
public class CircuitCalcController extends BaseController{
    private static final Logger logger = LoggerFactory.getLogger(CircuitCalcController.class);

    @Autowired
    private CircuitCalcService circuitCalcService;

    @PostMapping(value = "/bar")
    @ResponseStatus(HttpStatus.OK)
    public Map<String, String> stateBarCalc(@RequestBody CircuitClass data) {
        Map<String, String> map = circuitCalcService.stateBarCalc(data);
        return map;
    }
}
