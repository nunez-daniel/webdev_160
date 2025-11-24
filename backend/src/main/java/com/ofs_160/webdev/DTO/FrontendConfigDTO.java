package com.ofs_160.webdev.DTO;

public class FrontendConfigDTO {
    private final int feeId;

    public FrontendConfigDTO(int feeId) {
        this.feeId = feeId;
    }

    public int getFeeId() {
        return feeId;
    }
}