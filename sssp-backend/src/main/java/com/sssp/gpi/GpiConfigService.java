package com.sssp.gpi;

import com.sssp.admin.dto.GPIConfigRequest;
import com.sssp.admin.dto.GPIConfigResponse;
import org.springframework.stereotype.Service;

@Service
public class GpiConfigService {

    private final GPIService gpiService;

    public GpiConfigService(GPIService gpiService) {
        this.gpiService = gpiService;
    }

    public GPIConfigResponse getConfig() {
        return gpiService.getConfig();
    }

    public GPIConfigResponse updateConfig(GPIConfigRequest request) {
        return gpiService.updateConfig(request);
    }
}
