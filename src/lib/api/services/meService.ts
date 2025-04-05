// Re-export from companyService to maintain backward compatibility
// This allows existing imports of meService to continue working
export * from "./companyService";

// Alias the main hook for backwards compatibility
export { useCompanyInfo as usePersonalDetails } from "./companyService";
