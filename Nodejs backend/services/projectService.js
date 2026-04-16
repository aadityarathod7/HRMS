const Project = require('../models/Project');

const generateProjectId = async () => {
  const lastProject = await Project.findOne().sort({ projectId: -1 });
  if (!lastProject) return 'Sanvii-001';
  const lastNum = parseInt(lastProject.projectId.split('-')[1]);
  return `Sanvii-${(lastNum + 1).toString().padStart(3, '0')}`;
};

const parseTeamMembers = (members) => {
  if (!members) return [];
  if (Array.isArray(members)) return members;
  if (typeof members === 'string') return members.split(',').map(m => m.trim()).filter(Boolean);
  return [];
};

const createProject = async (data, createdBy) => {
  const projectId = await generateProjectId();
  const project = new Project({
    ...data,
    projectId,
    teamMembers: parseTeamMembers(data.teamMembers),
    createdBy,
    createdDate: new Date()
  });
  return await project.save();
};

const updateProject = async (projectId, data) => {
  const project = await Project.findOne({ projectId });
  if (!project) throw { status: 404, message: 'Project not found' };

  ['name', 'description', 'clientName', 'startDate', 'endDate', 'projectManager', 'budget', 'priority'].forEach(f => {
    if (data[f] !== undefined) project[f] = data[f];
  });
  if (data.teamMembers !== undefined) project.teamMembers = parseTeamMembers(data.teamMembers);
  project.updatedDate = new Date();
  return await project.save();
};

const getAllProjects = async () => {
  return await Project.find()
    .populate('projectManager', 'firstname lastname')
    .populate('teamMembers', 'firstname lastname');
};

const getProjectById = async (projectId) => {
  const project = await Project.findOne({ projectId })
    .populate('projectManager', 'firstname lastname')
    .populate('teamMembers', 'firstname lastname');
  if (!project) throw { status: 404, message: 'Project not found' };
  return project;
};

const updateProjectStatus = async (projectId, status) => {
  const project = await Project.findOne({ projectId });
  if (!project) throw { status: 404, message: 'Project not found' };
  project.status = status;
  project.updatedDate = new Date();
  return await project.save();
};

const getProjectsByStatus = async (status) => {
  return await Project.find({ status })
    .populate('projectManager', 'firstname lastname')
    .populate('teamMembers', 'firstname lastname');
};

module.exports = { createProject, updateProject, getAllProjects, getProjectById, updateProjectStatus, getProjectsByStatus };
