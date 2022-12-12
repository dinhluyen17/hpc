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

package org.apache.dolphinscheduler.quantum.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.commons.lang3.StringUtils;
import org.apache.dolphinscheduler.api.enums.Status;
import org.apache.dolphinscheduler.api.service.impl.BaseServiceImpl;
import org.apache.dolphinscheduler.api.utils.PageInfo;
import org.apache.dolphinscheduler.api.utils.Result;
import org.apache.dolphinscheduler.common.constants.Constants;
import org.apache.dolphinscheduler.dao.entity.Circuit;
import org.apache.dolphinscheduler.dao.mapper.CircuitMapper;
import org.apache.dolphinscheduler.quantum.controller.CircuitCreateRequest;
import org.apache.dolphinscheduler.quantum.controller.CircuitUpdateRequest;
import org.apache.dolphinscheduler.quantum.service.CircuitService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigInteger;
import java.text.MessageFormat;
import java.util.*;

/**
 * circuit service impl
 */
@Service
public class CircuitServiceImpl extends BaseServiceImpl implements CircuitService {

    private static final Logger logger = LoggerFactory.getLogger(CircuitServiceImpl.class);

    @Autowired
    private CircuitMapper circuitMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> create(Integer userId, CircuitCreateRequest circuitCreateRequest) {
        Map<String, Object> result = new HashMap<>();

        Circuit circuit = new Circuit();
        circuit.setUserId(userId);
        circuit.setName(circuitCreateRequest.getName());
        circuit.setDescription(circuitCreateRequest.getDescription());
        circuit.setJson(circuitCreateRequest.getJson());
        circuit.setQasm(circuitCreateRequest.getQasm());
        circuit.setQiskit(circuitCreateRequest.getQiskit());
        Date date = new Date();
        circuit.setCreateTime(date);
        circuit.setUpdateTime(date);
        circuit.setUpdateTime(date);
        circuit.setProjectCode(circuitCreateRequest.getProjectCode());

        // save user
        circuitMapper.insert(circuit);

        logger.info("Circuit is created and id is {}.", circuit.getId());
        result.put(Constants.DATA_LIST, circuit);
        putMsg(result, Status.SUCCESS);
        return result;
    }

    @Override
    public Map<String, Object> get(Integer id) {
        Map<String, Object> result = new HashMap<>();
        Circuit circuit = circuitMapper.selectById(id);
        result.put(Constants.DATA_LIST, circuit);
        putMsg(result, Status.SUCCESS);
        return result;
    }

    @Override
    public Result<Object> search(Integer userId, String keyword, String criteria, String direction, Integer pageNo, Integer pageSize) {
        Result<Object> result = new Result<>();

        Page<Circuit> page = new Page<>(pageNo, pageSize);

        IPage<Circuit> scheduleList =
                circuitMapper.queryCircuitPaging(page, userId, keyword, criteria, direction);

        PageInfo<Circuit> pageInfo = new PageInfo<>(pageNo, pageSize);
        pageInfo.setTotal((int) scheduleList.getTotal());
        pageInfo.setTotalList(scheduleList.getRecords());
        result.setData(pageInfo);
        putMsg(result, Status.SUCCESS);

        return result;
    }

    @Override
    public Map<String, Object> update(Integer id, CircuitUpdateRequest circuitUpdateRequest) throws IOException {
        Map<String, Object> result = new HashMap<>();
        result.put(Constants.STATUS, false);

        Circuit circuit = circuitMapper.selectById(id);
        if (circuit == null) {
            logger.error("circuit does not exist, id:{}.", id);
            putMsg(result, Status.USER_NOT_EXIST, id);
            return result;
        }
        if (StringUtils.isNotEmpty(circuitUpdateRequest.getName())) {
            circuit.setName(circuitUpdateRequest.getName());
        }

        if (circuitUpdateRequest.getDescription() != null) {
            circuit.setDescription(circuitUpdateRequest.getDescription());
        }
        if (circuitUpdateRequest.getJson() != null) {
            circuit.setJson(circuitUpdateRequest.getJson());
        }
        if (circuitUpdateRequest.getQasm() != null) {
            circuit.setQasm(circuitUpdateRequest.getQasm());
        }
        if (circuitUpdateRequest.getQiskit() != null) {
            circuit.setQiskit(circuitUpdateRequest.getQiskit());
        }
        Date now = new Date();
        circuit.setUpdateTime(now);
        // updateProcessInstance user
        if (circuitUpdateRequest.getProjectCode() != null) {
            circuit.setProjectCode(circuitUpdateRequest.getProjectCode());
        }
        int update = circuitMapper.updateById(circuit);
        if (update > 0) {
            logger.info("Circuit is updated and id is :{}.", id);
            putMsg(result, Status.SUCCESS);
        } else {
            logger.error("Circuit update error, id:{}.", id);
            putMsg(result, Status.UPDATE_USER_ERROR);
        }

        return result;
    }

    @Override
    public Map<String, Object> delete(List<Integer> ids) {
        Map<String, Object> result = new HashMap<>();

        int totalSuccess = 0;
        List<Integer> successCircuits = new ArrayList<>();
        Map<String, Object> successRes = new HashMap<>();
        int totalFailed = 0;
        List<Map<String, String>> failedInfo = new ArrayList<>();
        Map<String, Object> failedRes = new HashMap<>();
        for (Integer id : ids) {
            if (circuitMapper.deleteById(id) <= 0) {
                totalFailed++;
                Map<String, String> failedBody = new HashMap<>();
                failedBody.put("id", String.valueOf(id));
                Status status = Status.DELETE_RESOURCE_ERROR;
                String errorMessage = MessageFormat.format(status.getMsg(), id);
                failedBody.put("msg", errorMessage);
                failedInfo.add(failedBody);
            } else {
                totalSuccess++;
                successCircuits.add(id);
            }
        }
        successRes.put("sum", totalSuccess);
        successRes.put("ids", successCircuits);
        failedRes.put("sum", totalFailed);
        failedRes.put("info", failedInfo);
        Map<String, Object> res = new HashMap<>();
        res.put("success", successRes);
        res.put("failed", failedRes);
        putMsg(result, Status.SUCCESS);
        result.put(Constants.DATA_LIST, res);
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> duplicate(Integer id, String name, String description) {
        Map<String, Object> result = new HashMap<>();
        Integer insertResult = circuitMapper.duplicate(id, name, description);
        result.put(Constants.DATA_LIST, insertResult);
        putMsg(result, Status.SUCCESS);
        return result;
    }
}
