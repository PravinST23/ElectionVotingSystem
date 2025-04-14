import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { HowToVote } from '@mui/icons-material';

function ElectionCard({ election }) {
  return (
    <Card className="card">
      <CardContent>
        <HowToVote color="primary" />
        <Typography variant="h6">{election.name}</Typography>
        <Typography>{election.description}</Typography>
        <Typography>Status: {election.status}</Typography>
      </CardContent>
    </Card>
  );
}

export default ElectionCard;