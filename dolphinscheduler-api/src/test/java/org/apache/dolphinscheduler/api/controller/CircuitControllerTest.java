/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.apache.dolphinscheduler.api.controller;

import org.apache.dolphinscheduler.api.dto.circuit.CircuitUpdateRequest;
import org.apache.dolphinscheduler.api.enums.Status;
import org.apache.dolphinscheduler.api.service.impl.CircuitServiceImpl;
import org.apache.dolphinscheduler.api.service.impl.ProjectServiceImpl;
import org.apache.dolphinscheduler.api.utils.PageInfo;
import org.apache.dolphinscheduler.api.utils.Result;
import org.apache.dolphinscheduler.common.enums.UserType;
import org.apache.dolphinscheduler.common.utils.JSONUtils;
import org.apache.dolphinscheduler.dao.entity.Circuit;
import org.apache.dolphinscheduler.dao.entity.Project;
import org.apache.dolphinscheduler.dao.entity.Resource;
import org.apache.dolphinscheduler.dao.entity.User;
import org.apache.dolphinscheduler.dao.mapper.CircuitMapper;
import org.apache.dolphinscheduler.dao.mapper.ProjectMapper;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * project controller test
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class CircuitControllerTest {

    protected User user;

    @InjectMocks
    private CircuitController circuitController;

    @Mock
    private CircuitServiceImpl circuitService;

    @Mock
    private CircuitMapper circuitMapper;

    @BeforeEach
    public void before() {
        User loginUser = new User();
        loginUser.setId(1);
        loginUser.setUserType(UserType.GENERAL_USER);
        loginUser.setUserName("admin");
        user = loginUser;
    }

    @Test
    public void testUpdateCircuit() throws Exception {
        Result result = new Result();
        putMsg(result, Status.SUCCESS);

        CircuitUpdateRequest circuitUpdateRequest = new CircuitUpdateRequest();
        circuitUpdateRequest.setName("Name");
        Mockito.when(circuitService.update(user.getId(), circuitUpdateRequest)).thenReturn(result);
        Result response = circuitController.update(user.getId(), circuitUpdateRequest);
        Assertions.assertEquals(Status.SUCCESS.getCode(), response.getCode().intValue());
    }

    @Test
    public void testQueryCircuitById() {
        Result result = new Result();
        putMsg(result, Status.SUCCESS);
        Mockito.when(circuitMapper.selectById(1)).thenReturn(getCircuit());
        Mockito.when(circuitService.get(1)).thenReturn(result);
        Result response = circuitController.getCircuit(1);
        Assertions.assertEquals(Status.SUCCESS.getCode(), response.getCode().intValue());
    }

    @Test
    public void testQueryCircuitListPaging() {
        int pageNo = 1;
        int pageSize = 10;
        String searchVal = "";

        Result result = Result.success(new PageInfo<Resource>(1, 10));

        Mockito.when(circuitService.search(1, searchVal, "", "", pageNo, pageSize)).thenReturn(result);
        Result response = circuitController.queryCircuitList(user, pageNo, pageSize, "", "", searchVal);

        Assertions.assertTrue(response != null && response.isSuccess());
    }

    private Circuit getCircuit() {
        Circuit circuit = new Circuit();
        circuit.setId(1);
        circuit.setName("Name");
        circuit.setDescription("Description");
        circuit.setJson("Json");
        circuit.setQasm("Qasm");
        circuit.setQiskit("Qiskit");
        circuit.setProjectCode(1L);
        circuit.setCreateTime(new Date());
        circuit.setUpdateTime(new Date());
        return circuit;
    }

    private void putMsg(Result result, Status status, Object... statusParams) {
        result.setCode(status.getCode());
        if (statusParams != null && statusParams.length > 0) {
            result.setMsg(MessageFormat.format(status.getMsg(), statusParams));
        } else {
            result.setMsg(status.getMsg());
        }
    }
}
