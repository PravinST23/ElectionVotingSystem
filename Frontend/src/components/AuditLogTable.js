import React, { useEffect, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { toast } from 'react-toastify';

function AuditLogTable({ logs }) {
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (!hasShownToast.current && logs.length > 0) {
      toast.info(`${logs.length} audit logs loaded`);
      hasShownToast.current = true;
    }
  }, [logs]);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Action</TableCell>
          <TableCell>Details</TableCell>
          <TableCell>Timestamp</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.auditID}>
            <TableCell>{log.auditID}</TableCell>
            <TableCell>{log.action}</TableCell>
            <TableCell>{log.details}</TableCell>
            <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default AuditLogTable;
