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

package org.apache.dolphinscheduler.api.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.google.common.collect.Lists;
import org.apache.commons.collections.CollectionUtils;
import org.apache.dolphinscheduler.api.dto.circuit.CircuitCreateRequest;
import org.apache.dolphinscheduler.api.dto.circuit.CircuitUpdateRequest;
import org.apache.dolphinscheduler.api.enums.Status;
import org.apache.dolphinscheduler.api.permission.ResourcePermissionCheckService;
import org.apache.dolphinscheduler.api.service.impl.BaseServiceImpl;
import org.apache.dolphinscheduler.api.service.impl.CircuitServiceImpl;
import org.apache.dolphinscheduler.api.service.impl.UsersServiceImpl;
import org.apache.dolphinscheduler.api.utils.PageInfo;
import org.apache.dolphinscheduler.api.utils.Result;
import org.apache.dolphinscheduler.common.constants.Constants;
import org.apache.dolphinscheduler.common.enums.AuthorizationType;
import org.apache.dolphinscheduler.common.enums.UserType;
import org.apache.dolphinscheduler.common.utils.EncryptionUtils;
import org.apache.dolphinscheduler.dao.entity.*;
import org.apache.dolphinscheduler.dao.mapper.*;
import org.apache.dolphinscheduler.service.storage.StorageOperate;
import org.apache.dolphinscheduler.spi.enums.ResourceType;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
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

import java.io.IOException;
import java.util.*;

import static org.apache.dolphinscheduler.api.constants.ApiFuncIdentificationConstant.USER_MANAGER;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * circuit service test
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class CircuitServiceTest {

    private static final Logger logger = LoggerFactory.getLogger(CircuitServiceTest.class);

    @InjectMocks
    private CircuitServiceImpl circuitService;

    @Mock
    private CircuitMapper circuitMapper;

    private String queueName = "CircuitServiceTestQueue";

    private static final Logger serviceLogger = LoggerFactory.getLogger(BaseServiceImpl.class);

    @BeforeEach
    public void before() { }

    @AfterEach
    public void after() { }

    @Test
    public void testCreateCircuit() {
        Circuit circuit = getCircuit();

        CircuitCreateRequest circuitCreateRequest = new CircuitCreateRequest();
        circuitCreateRequest.setName(circuit.getName());
        circuitCreateRequest.setDescription(circuit.getDescription());
        circuitCreateRequest.setJson(circuit.getJson());
        circuitCreateRequest.setQasm(circuit.getQasm());
        circuitCreateRequest.setQiskit(circuit.getQiskit());
        circuitCreateRequest.setProjectCode(circuit.getProjectCode());

        try {
            when(circuitMapper.insert(any(Circuit.class))).thenReturn(1);
            // success
            Result result = circuitService.create(1, circuitCreateRequest);
            logger.info(result.toString());
            Assertions.assertEquals(Status.SUCCESS.getCode(), result.getCode().intValue());
            Circuit resultCircuit = (Circuit) result.getData();
            Assertions.assertNotNull(resultCircuit);
        } catch (Exception e) {
            logger.error(Status.CREATE_USER_ERROR.getMsg(), e);
            Assertions.fail();
        }
    }

    @Test
    public void testQueryCircuit() {
        Circuit circuit = getCircuit();
        when(circuitMapper.selectById(1))
                .thenReturn(getCircuit());
        Result result = circuitService.get(1);
        Circuit resultCircuit = (Circuit) result.getData();
        logger.info(resultCircuit.toString());
        Assertions.assertNotNull(resultCircuit);
        Assertions.assertEquals(resultCircuit.getUserId(), circuit.getUserId());
        Assertions.assertEquals(resultCircuit.getName(), circuit.getName());
        Assertions.assertEquals(resultCircuit.getDescription(), circuit.getDescription());
        Assertions.assertEquals(resultCircuit.getJson(), circuit.getJson());
        Assertions.assertEquals(resultCircuit.getQasm(), circuit.getQasm());
        Assertions.assertEquals(resultCircuit.getQiskit(), circuit.getQiskit());
        Assertions.assertEquals(resultCircuit.getProjectCode(), circuit.getProjectCode());
    }

//    @Test
//    public void testQueryCircuitList() {
//        Map<String, Object> result = circuitService.queryUserList(user);
//        logger.info(result.toString());
//        Assertions.assertEquals(Status.USER_NO_OPERATION_PERM, result.get(Constants.STATUS));
//
//        // success
//        Mockito.when(resourcePermissionCheckService.operationPermissionCheck(AuthorizationType.ACCESS_TOKEN, null, 1,
//                USER_MANAGER, serviceLogger)).thenReturn(true);
//        Mockito.when(resourcePermissionCheckService.resourcePermissionCheck(AuthorizationType.ACCESS_TOKEN, null, 0,
//                serviceLogger)).thenReturn(true);
//        user.setUserType(UserType.ADMIN_USER);
//        when(userMapper.queryEnabledUsers()).thenReturn(getUserList());
//        result = usersService.queryUserList(user);
//        List<User> userList = (List<User>) result.get(Constants.DATA_LIST);
//        Assertions.assertTrue(userList.size() > 0);
//    }

    @Test
    public void testQueryCircuitListPage() {
        Circuit circuit = new Circuit();
        IPage<Circuit> page = new Page<>(1, 10);
        page.setRecords(getCircuitList());
        when(circuitMapper.queryCircuitPaging(
                any(Page.class),
                any(Integer.class),
                any(String.class),
                any(String.class),
                any(String.class))
        ).thenReturn(page);

        // success
        Result result = circuitService.search(1, "", "", "", 1, 10);
        Assertions.assertEquals(Status.SUCCESS.getCode(), (int) result.getCode());
        PageInfo<Circuit> pageInfo = (PageInfo<Circuit>) result.getData();
        Assertions.assertTrue(pageInfo.getTotalList().size() > 0);
    }

    @Test
    public void testUpdateCircuit() throws IOException {
        Circuit circuit = getCircuit();

        CircuitUpdateRequest circuitUpdateRequest = new CircuitUpdateRequest();
        circuitUpdateRequest.setName(circuit.getName());
        // circuit not exist
        Result result = circuitService.update(0, circuitUpdateRequest);
        Assertions.assertEquals(Status.CIRCUIT_NOT_EXIST.getCode(), result.getCode().intValue());

        // success
        when(circuitMapper.selectById(1)).thenReturn(getCircuit());
        when(circuitMapper.updateById(any())).thenReturn(1);
        result = circuitService.update(circuit.getId(), circuitUpdateRequest);
        Assertions.assertEquals(Status.SUCCESS.getCode(), result.getCode().intValue());
    }

    @Test
    public void testDeleteUserById() {
        User loginUser = new User();
        try {
            when(circuitMapper.selectById(1)).thenReturn(getCircuit());
            when(circuitMapper.deleteById(1)).thenReturn(1);
            when(circuitMapper.deleteById(0)).thenReturn(0);

            // user not exist
            loginUser.setUserType(UserType.ADMIN_USER);
            Map<String, Object> result = circuitService.delete(Collections.singletonList(0));
            logger.info(result.toString());
            Assertions.assertEquals(Status.SUCCESS, result.get(Constants.STATUS));
            Map<String, Object> res = (Map<String, Object>) result.get(Constants.DATA_LIST);
            Map<String, Object> failedRes = (Map<String, Object>) res.get("failed");
            Integer totalFailed = (Integer) failedRes.get("sum");
            Assertions.assertNotEquals(0, totalFailed);
            // success
            result = circuitService.delete(Collections.singletonList(1));
            logger.info(result.toString());
            Assertions.assertEquals(Status.SUCCESS, result.get(Constants.STATUS));
            res = (Map<String, Object>) result.get(Constants.DATA_LIST);
            failedRes = (Map<String, Object>) res.get("failed");
            totalFailed = (Integer) failedRes.get("sum");
            Assertions.assertEquals(0, totalFailed);
            Map<String, Object> successRes = (Map<String, Object>) res.get("success");
            Integer totalSuccess = (Integer) successRes.get("sum");
            Assertions.assertEquals(1, totalSuccess);
        } catch (Exception e) {
            logger.error("delete circuit error", e);
            Assertions.assertTrue(false);
        }
    }

//    @Test
//    public void testBatchActivateUser() {
//        User user = new User();
//        user.setUserType(UserType.GENERAL_USER);
//        List<String> userNames = new ArrayList<>();
//        userNames.add("userTest0001");
//        userNames.add("userTest0002");
//        userNames.add("userTest0003~");
//        userNames.add("userTest0004");
//
//        try {
//            // not admin
//            Map<String, Object> result = usersService.batchActivateUser(user, userNames);
//            Assertions.assertEquals(Status.USER_NO_OPERATION_PERM, result.get(Constants.STATUS));
//
//            // batch activate user names
//            user.setUserType(UserType.ADMIN_USER);
//            when(userMapper.queryByUserNameAccurately("userTest0001")).thenReturn(getUser());
//            when(userMapper.queryByUserNameAccurately("userTest0002")).thenReturn(getDisabledUser());
//            result = usersService.batchActivateUser(user, userNames);
//            Map<String, Object> responseData = (Map<String, Object>) result.get(Constants.DATA_LIST);
//            Map<String, Object> successData = (Map<String, Object>) responseData.get("success");
//            int totalSuccess = (Integer) successData.get("sum");
//
//            Map<String, Object> failedData = (Map<String, Object>) responseData.get("failed");
//            int totalFailed = (Integer) failedData.get("sum");
//
//            Assertions.assertEquals(1, totalSuccess);
//            Assertions.assertEquals(3, totalFailed);
//            Assertions.assertEquals(Status.SUCCESS, result.get(Constants.STATUS));
//        } catch (Exception e) {
//            Assertions.assertTrue(false);
//        }
//    }

    private List<Circuit> getCircuitList() {
        List<Circuit> circuitList = new ArrayList<>();
        circuitList.add(getCircuit());
        return circuitList;
    }

    /**
     * get circuit
     */
    private Circuit getCircuit() {
        Integer id = 1;
        Integer userId = 1;
        String name = "Name";
        String description = "Description";
        String json = "Json";
        String qasm = "Qasm";
        String qiskit = "Qiskit";
        Long projectCode = 1L;

        Circuit circuit = new Circuit();
        circuit.setId(id);
        circuit.setUserId(userId);
        circuit.setName(name);
        circuit.setDescription(description);
        circuit.setJson(json);
        circuit.setQasm(qasm);
        circuit.setQiskit(qiskit);
        circuit.setProjectCode(projectCode);

        return circuit;
    }
}
