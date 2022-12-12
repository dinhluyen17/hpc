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

package org.apache.dolphinscheduler.quantum.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.dolphinscheduler.api.aspect.AccessLogAnnotation;
import org.apache.dolphinscheduler.api.controller.BaseController;
import org.apache.dolphinscheduler.api.dto.taskRelation.TaskRelationCreateRequest;
import org.apache.dolphinscheduler.api.exceptions.ApiException;
import org.apache.dolphinscheduler.api.utils.Result;
import org.apache.dolphinscheduler.common.constants.Constants;
import org.apache.dolphinscheduler.dao.entity.User;
import org.apache.dolphinscheduler.plugin.datasource.api.datasource.BaseDataSourceParamDTO;
import org.apache.dolphinscheduler.plugin.task.api.utils.ParameterUtils;
import org.apache.dolphinscheduler.quantum.service.CircuitService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigInteger;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import static org.apache.dolphinscheduler.api.enums.Status.*;

/**
 * circuit controller
 */
@Tag(name = "CIRCUIT_TAG")
@RestController
@RequestMapping("/circuit")
public class CircuitController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(CircuitController.class);

    @Autowired
    private CircuitService circuitService;


    @Operation(summary = "get", description = "GET_CIRCUIT_NOTES")
    @Parameters({
            @Parameter(name = "id", description = "ID", required = true, schema = @Schema(implementation = Integer.class))
    })
    @GetMapping(value = "/get")
    @ResponseStatus(HttpStatus.OK)
    @ApiException(GET_USER_INFO_ERROR)
    public Result getCircuit(@RequestParam(value = "id") Integer id) throws Exception {
        Map<String, Object> result = circuitService.get(id);
        return returnDataList(result);
    }

    @Operation(summary = "create", description = "CREATE_CIRCUIT_NOTES")
    @PostMapping(consumes = {"application/json"})
    @ResponseStatus(HttpStatus.CREATED)
    @ApiException(CREATE_USER_ERROR)
    @AccessLogAnnotation(ignoreRequestArgs = "loginUser")
    public Result createCircuit(@Parameter(hidden = true) @RequestAttribute(value = Constants.SESSION_USER) User loginUser,
                                @RequestBody CircuitCreateRequest circuitCreateRequest) throws Exception {
        Integer userId = loginUser.getId();
        Map<String, Object> result =
                circuitService.create(userId, circuitCreateRequest);
        return returnDataList(result);
    }


    @Operation(summary = "search", description = "QUERY_USER_LIST_NOTES")
    @Parameters({
            @Parameter(name = "pageNo", description = "PAGE_NO", required = true, schema = @Schema(implementation = int.class, example = "1")),
            @Parameter(name = "pageSize", description = "PAGE_SIZE", required = true, schema = @Schema(implementation = int.class, example = "10")),
            @Parameter(name = "criteria", description = "CRITERIA", schema = @Schema(implementation = String.class)),
            @Parameter(name = "direction", description = "DIRECTION", schema = @Schema(implementation = String.class)),
            @Parameter(name = "keyword", description = "KEYWORD", schema = @Schema(implementation = String.class))
    })
    @GetMapping(value = "/search")
    @ResponseStatus(HttpStatus.OK)
    @ApiException(QUERY_USER_LIST_PAGING_ERROR)
    @AccessLogAnnotation(ignoreRequestArgs = "loginUser")
    public Result queryCircuitList(@Parameter(hidden = true) @RequestAttribute(value = Constants.SESSION_USER) User loginUser,
                                   @RequestParam("pageNo") Integer pageNo,
                                   @RequestParam("pageSize") Integer pageSize,
                                   @RequestParam(value = "criteria", required = false) String criteria,
                                   @RequestParam(value = "direction", required = false) String direction,
                                   @RequestParam(value = "keyword", required = false) String keyword) {
        Result result = checkPageParams(pageNo, pageSize);
        if (!result.checkResult()) {
            return result;
        }
        keyword = ParameterUtils.handleEscapes(keyword);
        if (keyword != null) {
            keyword = keyword.toLowerCase(Locale.ROOT);
        }

        Integer userId = loginUser.getId();
        result = circuitService.search(userId, keyword, criteria, direction, pageNo, pageSize);
        return result;
    }


    @Operation(summary = "update", description = "UPDATE_CIRCUIT_NOTES")
    @PatchMapping(consumes = {"application/json"})
    @ResponseStatus(HttpStatus.CREATED)
    @ApiException(UPDATE_USER_ERROR)
    @AccessLogAnnotation(ignoreRequestArgs = "loginUser")
    public Result update(@RequestBody CircuitUpdateRequest circuitUpdateRequest) throws Exception {
        Map<String, Object> result =
                circuitService.update(circuitUpdateRequest);
        return returnDataList(result);
    }


    @Operation(summary = "delete", description = "DELETE_USER_BY_ID_NOTES")
    @Parameters({
            @Parameter(name = "ids", description = "CIRCUIT_IDS", required = true, schema = @Schema(implementation = List.class, example = "[100]"))
    })
    @DeleteMapping(value = "/delete")
    @ResponseStatus(HttpStatus.OK)
    @ApiException(DELETE_USER_BY_ID_ERROR)
    @AccessLogAnnotation
    public Result delete(@RequestParam(value = "ids") List<Integer> ids) throws Exception {
        Map<String, Object> result = circuitService.delete(ids);
        return returnDataList(result);
    }

    @Operation(summary = "duplicate", description = "DUPLICATE_CIRCUIT_NOTES")
    @Parameters({
            @Parameter(name = "id", description = "ID", required = true, schema = @Schema(implementation = Integer.class))
    })
    @PostMapping(value = "/duplicate")
    @ResponseStatus(HttpStatus.OK)
    @ApiException(GET_USER_INFO_ERROR)
    public Result duplicateCircuit(@RequestParam(value = "id") Integer id) {
        Map<String, Object> result = circuitService.duplicate(id);
        return returnDataList(result);
    }
}
