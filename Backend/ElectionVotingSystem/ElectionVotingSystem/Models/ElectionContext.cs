using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ElectionVotingSystem.Models
{
    public class ElectionContext : IdentityDbContext<IdentityUser, IdentityRole, string>
    {
        public ElectionContext(DbContextOptions<ElectionContext> options) : base(options) { }

        public DbSet<Voter> Voters { get; set; }
        public DbSet<Election> Elections { get; set; }
        public DbSet<Candidate> Candidates { get; set; }
        public DbSet<Vote> Votes { get; set; }
        public DbSet<PoliticalParty> PoliticalParties { get; set; }
        public DbSet<ElectionResult> ElectionResults { get; set; }
        public DbSet<VoterVerification> VoterVerifications { get; set; }
        public DbSet<ElectionSession> ElectionSessions { get; set; }
        public DbSet<VoterHistory> VoterHistories { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<ElectionConfiguration> ElectionConfigurations { get; set; }
        public DbSet<Official> Officials { get; set; } // Added
        public DbSet<OfficialVerification> OfficialVerifications { get; set; } // Added

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.HasKey(e => e.AuditID);
                entity.Property(e => e.UserId)
                      .HasColumnName("UserId")
                      .IsRequired(false);
                entity.HasOne(a => a.User)
                      .WithMany()
                      .HasForeignKey(a => a.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ElectionConfiguration>(entity => entity.HasKey(e => e.ConfigID));
            modelBuilder.Entity<ElectionResult>(entity => entity.HasKey(e => e.ResultID));
            modelBuilder.Entity<ElectionSession>(entity => entity.HasKey(e => e.SessionID));
            modelBuilder.Entity<PoliticalParty>(entity => entity.HasKey(e => e.PartyID));
            modelBuilder.Entity<VoterVerification>(entity => entity.HasKey(e => e.VerificationID));
            modelBuilder.Entity<Vote>(entity => entity.HasKey(e => e.VoteID));

            modelBuilder.Entity<ElectionConfiguration>()
                .HasOne(ec => ec.Election)
                .WithMany()
                .HasForeignKey(ec => ec.ElectionID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<ElectionResult>()
                .HasOne(er => er.Election)
                .WithMany()
                .HasForeignKey(er => er.ElectionID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<ElectionResult>()
                .HasOne(er => er.Candidate)
                .WithMany()
                .HasForeignKey(er => er.CandidateID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<ElectionSession>()
                .HasOne(es => es.Election)
                .WithMany()
                .HasForeignKey(es => es.ElectionID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<VoterVerification>()
                .HasOne(vv => vv.Voter)
                .WithMany()
                .HasForeignKey(vv => vv.VoterID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Vote>()
                .HasOne(v => v.Voter)
                .WithMany()
                .HasForeignKey(v => v.VoterID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Vote>()
                .HasOne(v => v.Candidate)
                .WithMany()
                .HasForeignKey(v => v.CandidateID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Vote>()
                .HasOne(v => v.Election)
                .WithMany()
                .HasForeignKey(v => v.ElectionID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Voter>().HasIndex(v => v.Email).IsUnique();
            modelBuilder.Entity<Voter>().HasIndex(v => v.NationalID).IsUnique();
            modelBuilder.Entity<PoliticalParty>().HasIndex(p => p.PartyName).IsUnique();
        }
    }
}