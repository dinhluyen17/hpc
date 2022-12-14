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
import org.apache.commons.io.IOUtils;
import org.apache.dolphinscheduler.api.aspect.AccessLogAnnotation;
import org.apache.dolphinscheduler.api.controller.BaseController;
import org.apache.dolphinscheduler.api.exceptions.ApiException;
import org.apache.dolphinscheduler.api.utils.Result;
import org.apache.dolphinscheduler.common.constants.Constants;
import org.apache.dolphinscheduler.dao.entity.Circuit;
import org.apache.dolphinscheduler.dao.entity.User;
import org.apache.dolphinscheduler.plugin.task.api.utils.ParameterUtils;
import org.apache.dolphinscheduler.quantum.service.CircuitService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

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
    public Result getCircuit(@RequestParam(value = "id") Integer id) {
        Map<String, Object> result = circuitService.get(id);
        return returnDataList(result);
    }

    @Operation(summary = "create", description = "CREATE_CIRCUIT_NOTES")
    @PostMapping(value = "/create", consumes = {"application/json"})
    @ResponseStatus(HttpStatus.CREATED)
    @ApiException(CREATE_USER_ERROR)
    @AccessLogAnnotation(ignoreRequestArgs = "loginUser")
    public Result createCircuit(@Parameter(hidden = true) @RequestAttribute(value = Constants.SESSION_USER) User loginUser,
                                @RequestBody CircuitCreateRequest circuitCreateRequest) {
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
    @PatchMapping(value = "/update", consumes = {"application/json"})
    @ResponseStatus(HttpStatus.CREATED)
    @ApiException(UPDATE_USER_ERROR)
    @AccessLogAnnotation(ignoreRequestArgs = "loginUser")
    public Result update(@RequestParam(value = "id") Integer id,
                         @RequestBody CircuitUpdateRequest circuitUpdateRequest) throws Exception {
        Map<String, Object> result =
                circuitService.update(id, circuitUpdateRequest);
        return returnDataList(result);
    }


    @Operation(summary = "delete", description = "DELETE_USER_BY_ID_NOTES")
    @Parameters({
            @Parameter(name = "id", description = "CIRCUIT_ID", required = true, schema = @Schema(implementation = List.class, example = "[100]"))
    })
    @DeleteMapping(value = "/delete")
    @ResponseStatus(HttpStatus.OK)
    @ApiException(DELETE_USER_BY_ID_ERROR)
    @AccessLogAnnotation
    public Result delete(@RequestParam(value = "id") List<Integer> id) throws Exception {
        Map<String, Object> result = circuitService.delete(id);
        return returnDataList(result);
    }

    @Operation(summary = "duplicate", description = "DUPLICATE_CIRCUIT_NOTES")
    @Parameters({
            @Parameter(name = "id", description = "ID", required = true, schema = @Schema(implementation = Integer.class)),
            @Parameter(name = "name", description = "NAME", required = true, schema = @Schema(implementation = String.class)),
            @Parameter(name = "description", description = "DESCRIPTION", schema = @Schema(implementation = String.class))
    })
    @PostMapping(value = "/duplicate")
    @ResponseStatus(HttpStatus.OK)
    @ApiException(GET_USER_INFO_ERROR)
    public Result duplicateCircuit(@RequestParam(value = "id") Integer id,
                                   @RequestParam(value = "name") String name,
                                   @RequestParam(value = "description", required = false) String description) {
        Map<String, Object> result = circuitService.duplicate(id, name, description);
        return returnDataList(result);
    }

    @Operation(summary = "export", description = "DOWNLOAD_RESOURCE_FILE_NOTES")
    @Parameters({
            @Parameter(name = "id", description = "CIRCUIT_ID", required = true, schema = @Schema(implementation = Integer.class, example = "1"))
    })
    @GetMapping(value = "/export")
    @ResponseBody
    @ApiException(DOWNLOAD_RESOURCE_FILE_ERROR)
    public ResponseEntity exportCircuit(@RequestParam(value = "id") Integer id) {
        Map<String, Object> result = circuitService.get(id);
        Circuit circuit = (Circuit) result.get("data");
        String name = circuit.getName();
        String json = circuit.getJson();
        byte[] logBytes = json.getBytes();
        return ResponseEntity
                .ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + name + ".json" + "\"")
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .body(logBytes);
    }

    @Operation(summary = "batchExport", description = "DOWNLOAD_RESOURCE_FILE_NOTES")
    @Parameters({
            @Parameter(name = "id", description = "ID", required = true, schema = @Schema(implementation = List.class, example = "[1, 2]"))
    })
    @GetMapping(value = "/batchExport", produces="application/zip")
    @ResponseBody
    @ApiException(DOWNLOAD_RESOURCE_FILE_ERROR)
    public ResponseEntity exportCircuit(@RequestParam(value = "id") List<Integer> id) throws IOException {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        BufferedOutputStream bufferedOutputStream = new BufferedOutputStream(byteArrayOutputStream);
        ZipOutputStream zipOutputStream = new ZipOutputStream(bufferedOutputStream);

        for (Integer circuitId : id) {
            Map<String, Object> result = circuitService.get(circuitId);
            Circuit circuit = (Circuit) result.get("data");
            String name = circuit.getName();
            String json = circuit.getJson();
            byte[] logBytes = json.getBytes();

            zipOutputStream.putNextEntry(new ZipEntry(name));
            zipOutputStream.write(logBytes);
            zipOutputStream.closeEntry();
        }

        zipOutputStream.finish();
        zipOutputStream.flush();

        IOUtils.closeQuietly(zipOutputStream);
        IOUtils.closeQuietly(bufferedOutputStream);
        IOUtils.closeQuietly(byteArrayOutputStream);

        return ResponseEntity
                .ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"batch.zip\"")
                .body(byteArrayOutputStream.toByteArray());
    }

//    @Operation(summary = "import", description = "UPLOAD_RESOURCE_FILE_NOTES")
//    @Parameters({
//            @Parameter(name = "id", description = "ID", required = true, schema = @Schema(implementation = Integer.class, example = "1")),
//            @Parameter(name = "file", description = "FILE", required = true, schema = @Schema(implementation = MultipartFile.class))
//    })
//    @PostMapping(value = "/import")
//    @ResponseStatus(HttpStatus.OK)
//    @ApiException(UPDATE_USER_ERROR)
//    public Result importCircuit(@RequestParam(value = "id") Integer id,
//                                @RequestParam(value = "file") MultipartFile file) throws Exception {
//        String json = new String(file.getBytes());
//        CircuitUpdateRequest circuitUpdateRequest = new CircuitUpdateRequest();
//        circuitUpdateRequest.setJson(json);
//        Map<String, Object> result = circuitService.update(id, circuitUpdateRequest);
//        return returnDataList(result);
//    }
}
