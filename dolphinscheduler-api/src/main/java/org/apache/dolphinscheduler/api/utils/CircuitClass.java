package org.apache.dolphinscheduler.api.utils;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@NoArgsConstructor
@Getter
@Setter
public class CircuitClass {

    public List<String> qStates;

    public List<String> qProb;

    public CircuitClass(List<String> qStates, List<String> qProb) {
        this.qStates = qStates;
        this.qProb = qProb;
    }

    @Override
    public String toString() {
        return "CircuitClass{" +
                "qStates=" + qStates +
                ", qProb=" + qProb +
                '}';
    }
}
