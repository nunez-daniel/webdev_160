package com.ofs_160.webdev.Controller;

import com.ofs_160.webdev.DTO.FrontendConfigDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    @Value("${custom.fee.id}")
    private int customFeeId;

    @GetMapping
    public FrontendConfigDTO getConfig() {
        return new FrontendConfigDTO(customFeeId);
    }
}