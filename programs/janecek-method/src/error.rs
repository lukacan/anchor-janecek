use anchor_lang::error_code;

#[error_code]
pub enum VotingError {
    #[msg("Voting temporarily stopped")]
    VotingInEmergencyMode,
    #[msg("Party Registrations not Allowed")]
    PartyRegistrationsNotAllowed,
    #[msg("Voter Registrations not Allowed")]
    VoterRegistrationsNotAllowed,
    #[msg("Voting not Allowed")]
    VotingNotAllowed,
    #[msg("Cannot change Voting Infos in not Initial state")]
    NotInitialState,
    #[msg("Cannot start Voting if Registrations were not started")]
    StartRegistrationsFirst,

    #[msg("Addition overflow")]
    AdditionOverflow,
    #[msg("Subtraction underflow")]
    SubtractionUnderflow,

    #[msg("Cannot vote positive two time for same Party")]
    NoBothPositiveToSame,
    #[msg("No more positive Votes")]
    NoMorePosVotes,
    #[msg("No more Votes")]
    NoMoreVotes,
    #[msg("Vote two Positive first")]
    VoteTwoPosFirst,

    #[msg("Invalid Party name")]
    InvalidPartyName,

}
