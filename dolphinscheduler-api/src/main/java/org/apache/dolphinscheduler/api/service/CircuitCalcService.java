package org.apache.dolphinscheduler.api.service;
import org.apache.dolphinscheduler.api.utils.CircuitClass;
import org.apache.dolphinscheduler.api.utils.Result;

import java.util.List;
import java.util.Map;


public interface CircuitCalcService {

    Map<String, String> stateBarCalc(CircuitClass data);
    Result vectCalc(List<String> qStates, List<String> qProb);
}
