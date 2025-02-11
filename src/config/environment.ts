// Environment variables
export const ENTRY_POINT_ADDRESS = process.env.ENTRY_POINT_ADDRESS || '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';
export const RPC_URL = process.env.RPC_URL || '';
export const EOA1_PK = process.env.EOA1_PK || '';
export const EOA2_PK = process.env.EOA2_PK || '';
export const IS_LOCAL = process.env.NODE_ENV === 'development';
export const PORT = process.env.PORT || 3001; 