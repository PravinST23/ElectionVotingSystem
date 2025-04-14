import * as signalR from '@microsoft/signalr';

const URL = 'https://localhost:7252/electionHub';

class SignalRService {
  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(URL, { accessTokenFactory: () => localStorage.getItem('token') })
      .withAutomaticReconnect()
      .build();

    this.connection.start().catch((err) => console.error('SignalR Connection Error:', err));
  }

  onVoteUpdate(callback) {
    this.connection.on('ReceiveVoteUpdate', callback);
  }

  onElectionStatusUpdate(callback) {
    this.connection.on('ReceiveElectionStatusUpdate', callback);
  }

  onVerificationUpdate(callback) {
    this.connection.on('ReceiveVerificationUpdate', callback);
  }

  onAuditLogUpdate(callback) {
    this.connection.on('ReceiveAuditLogUpdate', (auditId, action, details) =>
      callback({ auditId, action, details, timestamp: new Date().toISOString() })
    );
  }

  onCandidateUpdate(callback) {
    this.connection.on('ReceiveCandidateUpdate', callback);
  }

  onApprovalUpdate(callback) {
    this.connection.on('ReceiveApprovalUpdate', callback);
  }

  joinAdminGroup() {
    if (this.connection.state === signalR.HubConnectionState.Connected) {
      this.connection.invoke('JoinAdminGroup').catch((err) => console.error(err));
    } else {
      this.connection.on('connected', () => {
        this.connection.invoke('JoinAdminGroup').catch((err) => console.error(err));
      });
    }
  }

  leaveAdminGroup() {
    if (this.connection.state === signalR.HubConnectionState.Connected) {
      this.connection.invoke('LeaveAdminGroup').catch((err) => console.error(err));
    }
  }
}

export default new SignalRService();