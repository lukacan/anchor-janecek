use anchor_lang::error_code;

#[error_code]
pub enum VotingError {
    #[msg("Voting temporarily stopped")]
    VotingInEmergencyMode,
    #[msg("Voting in wrong state")]
    VotingInWrongState,
}
