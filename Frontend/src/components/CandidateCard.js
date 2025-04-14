import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { Person } from '@mui/icons-material';

function CandidateCard({ candidate }) {
  return (
    <Card className="card">
      <CardContent>
        <Person color="primary" />
        <Typography variant="h6">{`${candidate.firstName} ${candidate.lastName}`}</Typography>
        <Typography>Party ID: {candidate.partyID}</Typography>
        <Typography>Election ID: {candidate.electionID}</Typography>
      </CardContent>
    </Card>
  );
}

export default CandidateCard;