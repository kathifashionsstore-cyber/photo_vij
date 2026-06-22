import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Plus, Trash2, Mail, Phone, Award, ShieldCheck, ShieldAlert, Star, AlertTriangle, Key } from 'lucide-react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export const Teams = () => {
  const { user, loading: authLoading, login } = useAuth();
  
  // Auth state credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Core component states
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modals state
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showCrewModal, setShowCrewModal] = useState(false);

  // Form states
  const [newTeam, setNewTeam] = useState({
    name: "",
    leaderId: "",
    rating: 5,
    utilization: 0
  });

  const [newMember, setNewMember] = useState({
    name: "",
    phone: "",
    role: "Photographer",
    teamId: "",
    skills: "",
    checkedIn: false
  });

  // Fetch teams and members
  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const [teamsSnap, membersSnap] = await Promise.all([
        getDocs(collection(db, 'teams')),
        getDocs(collection(db, 'members'))
      ]);

      const teamsList = [];
      teamsSnap.forEach(doc => {
        teamsList.push({ id: doc.id, ...doc.data() });
      });

      const membersList = [];
      membersSnap.forEach(doc => {
        membersList.push({ id: doc.id, ...doc.data() });
      });

      setTeams(teamsList);
      setMembers(membersList);
    } catch (err) {
      console.error("Firestore fetch error:", err);
      if (err.code === 'permission-denied' || err.message.includes('permission')) {
        setError("Permission Denied: Make sure you are signed in with admin credentials.");
      } else {
        setError("Failed to load teams. " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      await login(email, password);
    } catch (err) {
      console.error("Login failed:", err);
      setLoginError("Invalid email or password. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Add Team handler
  const handleAddTeam = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const teamDoc = {
        name: newTeam.name,
        leaderId: newTeam.leaderId || "",
        rating: Number(newTeam.rating || 5),
        utilization: Number(newTeam.utilization || 0),
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'teams'), teamDoc);
      setTeams(prev => [...prev, { id: docRef.id, ...teamDoc }]);
      setShowTeamModal(false);
      setNewTeam({ name: "", leaderId: "", rating: 5, utilization: 0 });
    } catch (err) {
      console.error("Add team failed:", err);
      setError("Failed to create team: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add Crew Member handler
  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const memberDoc = {
        name: newMember.name,
        phone: newMember.phone,
        role: newMember.role,
        teamId: newMember.teamId,
        skills: newMember.skills.split(',').map(s => s.trim()).filter(Boolean),
        checkedIn: newMember.checkedIn
      };

      const docRef = await addDoc(collection(db, 'members'), memberDoc);
      setMembers(prev => [...prev, { id: docRef.id, ...memberDoc }]);
      setShowCrewModal(false);
      setNewMember({ name: "", phone: "", role: "Photographer", teamId: "", skills: "", checkedIn: false });
    } catch (err) {
      console.error("Add member failed:", err);
      setError("Failed to register crew member: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Team handler
  const handleDeleteTeam = async (id) => {
    setLoading(true);
    setError("");
    try {
      await deleteDoc(doc(db, 'teams', id));
      setTeams(prev => prev.filter(t => t.id !== id));
      // Optionally reset member teamIds
      const updates = members.filter(m => m.teamId === id).map(async (m) => {
        await updateDoc(doc(db, 'members', m.id), { teamId: "" });
      });
      await Promise.all(updates);
      setMembers(prev => prev.map(m => m.teamId === id ? { ...m, teamId: "" } : m));
    } catch (err) {
      console.error("Delete team failed:", err);
      setError("Failed to delete team: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Member handler
  const handleDeleteMember = async (id) => {
    setLoading(true);
    setError("");
    try {
      await deleteDoc(doc(db, 'members', id));
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error("Delete member failed:", err);
      setError("Failed to remove crew member: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render full screen loading spinner for auth
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-500 uppercase tracking-widest">Checking Authentication...</span>
      </div>
    );
  }

  // Render Login Prompt if not logged in
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-6 shadow-2xl relative overflow-hidden">
          {/* Shimmer background */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-3xl" />

          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-brand-gold/10 text-brand-gold rounded-2xl flex items-center justify-center mx-auto mb-2 border border-brand-gold/20">
              <Key className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif text-white font-bold">Authentication Required</h2>
            <p className="text-xs text-gray-500 font-light">Please log in with your administrator account to access the Teams dashboard.</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-950/20 border border-red-900/50 text-red-400 text-xs rounded-xl flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-sans">
            <div className="space-y-1">
              <label className="text-gray-500 uppercase tracking-wider">Email Address</label>
              <input 
                required
                type="email" 
                placeholder="admin@snaplicaphoto.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/45 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-gray-500 uppercase tracking-wider">Password</label>
              <input 
                required
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/45 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
              />
            </div>

            <button 
              type="submit"
              disabled={loginLoading}
              className="w-full py-4 bg-brand-gold hover:bg-amber-500 text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              {loginLoading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                "Log In"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Crew & Teams Manager</h1>
          <p className="text-xs text-gray-500 mt-1 font-light">Monitor availability and group staff members under operational teams.</p>
        </div>

        <div className="flex gap-2.5">
          <button 
            onClick={() => setShowTeamModal(true)}
            className="px-4 py-2.5 bg-black/40 border border-white/10 hover:border-brand-gold text-brand-gold hover:text-black hover:bg-brand-gold text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Register Team
          </button>
          <button 
            onClick={() => setShowCrewModal(true)}
            className="px-4 py-2.5 bg-brand-gold hover:bg-amber-500 text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4 stroke-[3]" /> Register Crew
          </button>
        </div>
      </div>

      {/* Database error notification */}
      {error && (
        <div className="p-3.5 bg-red-950/20 border border-red-900/40 text-red-400 text-xs rounded-xl flex items-center gap-2 max-w-2xl">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state indicator */}
      {loading && (
        <div className="flex items-center gap-2 text-xs text-brand-gold font-mono">
          <div className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
          <span>Syncing Firestore...</span>
        </div>
      )}

      {/* Dashboard body grid */}
      {teams.length === 0 ? (
        <div className="text-center py-20 bg-brand-card/20 rounded-3xl border border-white/5 max-w-2xl mx-auto space-y-4">
          <Users className="w-12 h-12 text-brand-gold mx-auto opacity-30" />
          <h3 className="text-white font-serif font-bold text-lg">No Teams Found</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">No operational teams are registered. Create a team structure, then add crew members to it.</p>
          <button 
            onClick={() => setShowTeamModal(true)}
            className="px-5 py-2.5 bg-brand-gold text-black text-xs uppercase font-bold tracking-wider rounded-full hover:scale-105 transition-transform"
          >
            Create Your First Team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {teams.map((team) => {
            const teamMembers = members.filter(m => m.teamId === team.id);
            const leader = members.find(m => m.id === team.leaderId);

            return (
              <div 
                key={team.id}
                className="bg-brand-card border border-white/5 rounded-3xl p-6 space-y-6 relative hover:border-white/10 transition-colors shadow-xl"
              >
                {/* Team metadata header */}
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-white font-serif font-bold text-lg">{team.name}</h3>
                    <span className="text-[10px] text-gray-500 font-sans block mt-0.5">
                      Leader: <strong className="text-brand-gold font-medium">{leader ? leader.name : "None Assigned"}</strong>
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5">
                    {/* Stars */}
                    <div className="flex gap-0.5 text-brand-gold">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${i < (team.rating || 5) ? 'fill-current' : 'opacity-20'}`} 
                        />
                      ))}
                    </div>
                    
                    {/* Utilization */}
                    <span className="text-[9px] uppercase tracking-wider font-bold text-gray-500 font-mono">
                      {team.utilization || 0}% utilization
                    </span>
                  </div>
                </div>

                {/* Utilization meter */}
                <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-gold" 
                    style={{ width: `${team.utilization || 0}%` }}
                  />
                </div>

                {/* Members list under team */}
                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
                    Crew Members ({teamMembers.length})
                  </h4>

                  {teamMembers.length === 0 ? (
                    <div className="p-4 bg-black/10 rounded-xl border border-white/5 text-center text-gray-600 text-xs font-light">
                      No members assigned. Register a crew member to this team.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {teamMembers.map((member) => (
                        <div 
                          key={member.id}
                          className="p-4 bg-black/20 border border-white/5 hover:border-white/10 rounded-xl flex justify-between items-center gap-4 relative group"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h5 className="text-white font-serif font-bold text-sm">{member.name}</h5>
                              <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider
                                ${member.checkedIn 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-gray-500/10 text-gray-500 border border-white/5'}`}
                              >
                                {member.checkedIn ? 'In' : 'Out'}
                              </span>
                            </div>
                            <span className="text-[10px] text-brand-gold uppercase font-mono tracking-wider block">
                              {member.role}
                            </span>
                            
                            {/* Skills */}
                            {member.skills && member.skills.length > 0 && (
                              <div className="flex gap-1.5 flex-wrap pt-1">
                                {member.skills.map((skill, sIdx) => (
                                  <span key={sIdx} className="text-[8px] bg-white/5 border border-white/5 text-gray-400 px-1.5 py-0.5 rounded font-sans">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-gray-500 flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-gray-600" /> {member.phone}
                            </span>
                            
                            <button 
                              onClick={() => handleDeleteMember(member.id)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-red-400 transition-all"
                              title="Delete Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Team footer control */}
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <span className="text-[10px] text-gray-600 font-sans flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-brand-gold" /> Active Operational Unit
                  </span>
                  
                  <button 
                    onClick={() => handleDeleteTeam(team.id)}
                    className="p-2 bg-white/5 border border-white/5 hover:bg-red-950/20 hover:border-red-900/30 rounded-xl text-gray-500 hover:text-red-400 transition-all flex items-center gap-1.5 text-xs font-semibold"
                    title="Delete Team"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Team
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Team Dialog Modal */}
      <AnimatePresence>
        {showTeamModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99000] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0F1117] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-white font-serif font-bold text-lg">Create Team Profile</h3>
                <button onClick={() => setShowTeamModal(false)} className="text-gray-500 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleAddTeam} className="space-y-4 text-xs font-sans">
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase tracking-wider font-semibold">Team Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Team Alfa"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-black/45 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase tracking-wider font-semibold">Rating (1-5)</label>
                    <input 
                      required
                      type="number" 
                      min="1" 
                      max="5"
                      placeholder="5"
                      value={newTeam.rating}
                      onChange={(e) => setNewTeam(prev => ({ ...prev, rating: e.target.value }))}
                      className="w-full bg-black/45 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase tracking-wider font-semibold">Utilization %</label>
                    <input 
                      required
                      type="number" 
                      min="0" 
                      max="100"
                      placeholder="e.g. 75"
                      value={newTeam.utilization}
                      onChange={(e) => setNewTeam(prev => ({ ...prev, utilization: e.target.value }))}
                      className="w-full bg-black/45 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase tracking-wider font-semibold">Leader (Optional)</label>
                  <select
                    value={newTeam.leaderId}
                    onChange={(e) => setNewTeam(prev => ({ ...prev, leaderId: e.target.value }))}
                    className="w-full bg-black/90 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
                  >
                    <option value="">No Leader</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-brand-gold text-black hover:bg-amber-500 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Create Team"
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Crew member / Register Crew Modal */}
      <AnimatePresence>
        {showCrewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99000] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0F1117] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-white font-serif font-bold text-lg">Register Crew Member</h3>
                <button onClick={() => setShowCrewModal(false)} className="text-gray-500 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-4 text-xs font-sans">
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase tracking-wider font-semibold">Full Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Prasad Rao"
                    value={newMember.name}
                    onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-black/45 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase tracking-wider font-semibold">Phone</label>
                    <input 
                      required
                      type="tel" 
                      placeholder="e.g. 9494387387"
                      value={newMember.phone}
                      onChange={(e) => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-black/45 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase tracking-wider font-semibold">Role</label>
                    <select 
                      value={newMember.role}
                      onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full bg-black/90 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
                    >
                      <option value="Photographer">Photographer</option>
                      <option value="Cinematographer">Cinematographer</option>
                      <option value="Editor">Editor</option>
                      <option value="Drone Operator">Drone Operator</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase tracking-wider font-semibold">Assign Team</label>
                  <select 
                    value={newMember.teamId}
                    onChange={(e) => setNewMember(prev => ({ ...prev, teamId: e.target.value }))}
                    className="w-full bg-black/90 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
                  >
                    <option value="">No Team Assigned</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase tracking-wider font-semibold">Skills (comma-separated list)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Candid, Cinematic, Gimbals, Lighting"
                    value={newMember.skills}
                    onChange={(e) => setNewMember(prev => ({ ...prev, skills: e.target.value }))}
                    className="w-full bg-black/45 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="checkedIn"
                    checked={newMember.checkedIn}
                    onChange={(e) => setNewMember(prev => ({ ...prev, checkedIn: e.target.checked }))}
                    className="accent-brand-gold w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="checkedIn" className="text-gray-400 cursor-pointer select-none">Checked In to Operations</label>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-brand-gold text-black hover:bg-amber-500 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Register Crew"
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Teams;
