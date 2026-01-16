
export function getCameraConfig(isMobile: boolean) {
    return {
        facingMode: isMobile ? "environment" : "user"
    };
}
