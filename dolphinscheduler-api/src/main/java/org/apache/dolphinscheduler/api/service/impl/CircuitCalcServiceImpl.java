package org.apache.dolphinscheduler.api.service.impl;

import org.apache.dolphinscheduler.api.service.CircuitCalcService;
import org.apache.dolphinscheduler.api.utils.CircuitClass;
import org.apache.dolphinscheduler.api.utils.Result;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class CircuitCalcServiceImpl extends BaseServiceImpl implements CircuitCalcService {

    public static final Logger logger = LoggerFactory.getLogger(CircuitCalcServiceImpl.class);


    @Override
    public Map<String, String> stateBarCalc(CircuitClass data) {
        Map<String, String> map = new HashMap<>();
        map = IntStream.range(0, data.qStates.size()).boxed().collect(Collectors.toMap(i -> data.qStates.get(i), i -> data.qProb.get(i)));
        return map;
    }

    @Override
    public Result vectCalc(List<String> qStates, List<String> qProbs) {
        return null;
    }
}
