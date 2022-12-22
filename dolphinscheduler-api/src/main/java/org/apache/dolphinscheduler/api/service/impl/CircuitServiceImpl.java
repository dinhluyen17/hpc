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

package org.apache.dolphinscheduler.api.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.commons.lang3.StringUtils;
import org.apache.dolphinscheduler.api.enums.Status;
import org.apache.dolphinscheduler.api.utils.PageInfo;
import org.apache.dolphinscheduler.api.utils.Result;
import org.apache.dolphinscheduler.common.constants.Constants;
import org.apache.dolphinscheduler.common.enums.AuthorizationType;
import org.apache.dolphinscheduler.common.utils.CodeGenerateUtils;
import org.apache.dolphinscheduler.dao.entity.Circuit;
import org.apache.dolphinscheduler.dao.entity.Project;
import org.apache.dolphinscheduler.dao.mapper.CircuitMapper;
import org.apache.dolphinscheduler.api.dto.circuit.CircuitCreateRequest;
import org.apache.dolphinscheduler.api.dto.circuit.CircuitUpdateRequest;
import org.apache.dolphinscheduler.api.service.CircuitService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.text.MessageFormat;
import java.util.*;

import static org.apache.dolphinscheduler.api.constants.ApiFuncIdentificationConstant.PROJECT_CREATE;

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
    public Result create(Integer userId, CircuitCreateRequest circuitCreateRequest) {
        Result result = new Result();

        checkDesc(result, circuitCreateRequest.getDescription());
        if (result.getCode() != Status.SUCCESS.getCode()) {
            return result;
        }

        String name = circuitCreateRequest.getName();
        Circuit circuit = circuitMapper.queryByName(name);
        if (circuit != null) {
            logger.warn("Circuit {} already exists.", circuit.getName());
            putMsg(result, Status.CIRCUIT_ALREADY_EXISTS, name);
            return result;
        }

        Date now = new Date();

        try {
            circuit = Circuit
                    .builder()
                    .userId(userId)
                    .name(name)
                    .json(circuitCreateRequest.getJson())
                    .qasm(circuitCreateRequest.getQasm())
                    .qiskit(circuitCreateRequest.getQiskit())
                    .description(circuitCreateRequest.getDescription())
                    .createTime(now)
                    .updateTime(now)
                    .projectCode(circuitCreateRequest.getProjectCode())
                    .build();
        } catch (CodeGenerateUtils.CodeGenerateException e) {
            logger.error("Generate process definition code error.", e);
            putMsg(result, Status.CREATE_CIRCUIT_ERROR);
            return result;
        }

        if (circuitMapper.insert(circuit) > 0) {
            logger.info("Circuit is created and id is :{}", circuit.getId());
            result.setData(circuit);
            putMsg(result, Status.SUCCESS);
        } else {
            logger.error("Circuit create error, circuitName:{}.", circuit.getName());
            putMsg(result, Status.CREATE_CIRCUIT_ERROR);
        }
        return result;
    }

    @Override
    public Result get(Integer id) {
        Result result = new Result();
        Circuit circuit = circuitMapper.selectById(id);
        result.setData(circuit);
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
    public Result update(Integer id, CircuitUpdateRequest circuitUpdateRequest) throws IOException {
        Result result = new Result();

        checkDesc(result, circuitUpdateRequest.getDescription());
        if (result.getCode() != Status.SUCCESS.getCode()) {
            return result;
        }

        Circuit circuit = circuitMapper.selectById(id);
        if (circuit == null) {
            logger.error("circuit does not exist, id:{}.", id);
            putMsg(result, Status.CIRCUIT_NOT_EXIST, id);
            return result;
        }

        String name = circuitUpdateRequest.getName();
        if (StringUtils.isNotEmpty(name)) {
            circuit.setName(circuitUpdateRequest.getName());

            Circuit tempCircuit = circuitMapper.queryByName(name);
            if (tempCircuit != null
                    && !Objects.equals(tempCircuit.getId(), id)
                    && Objects.equals(tempCircuit.getProjectCode(), circuitUpdateRequest.getProjectCode())
            ) {
                putMsg(result, Status.CIRCUIT_ALREADY_EXISTS, name);
                return result;
            }
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

        int update = circuitMapper.updateById(circuit);
        if (update > 0) {
            logger.info("Circuit is updated and id is :{}", circuit.getId());
            result.setData(circuit);
            putMsg(result, Status.SUCCESS);
        } else {
            logger.error("Circuit update error, id:{}, name:{}.", circuit.getId(), circuit.getName());
            putMsg(result, Status.UPDATE_PROJECT_ERROR);
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
                Status status = Status.DELETE_CIRCUIT_ERROR;
                String errorMessage = MessageFormat.format(status.getMsg(), id);
                failedBody.put("msg", errorMessage);
                failedInfo.add(failedBody);
            } else {
                totalSuccess++;
                successCircuits.add(id);
            }
        }
        successRes.put("sum", totalSuccess);
        successRes.put("id", successCircuits);
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

    /**
     * check circuit description
     *
     * @param result
     * @param desc   desc
     */
    public static void checkDesc(Result result, String desc) {
        if (!StringUtils.isEmpty(desc) && desc.codePointCount(0, desc.length()) > 255) {
            logger.warn("Parameter description check failed.");
            result.setCode(Status.REQUEST_PARAMS_NOT_VALID_ERROR.getCode());
            result.setMsg(MessageFormat.format(Status.REQUEST_PARAMS_NOT_VALID_ERROR.getMsg(), "desc length"));
        } else {
            result.setCode(Status.SUCCESS.getCode());
        }
    }
}
