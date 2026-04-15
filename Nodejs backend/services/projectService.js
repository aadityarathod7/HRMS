const Project = require('../models/Project');

const generateProjectId = async () => {
  const lastProject = await Project.findOne().sort({ projectId: -1 });
  if (!lastProject) return 'Sanvii-001';

  const lastNum = parseInt(lastProject.projectId.split('-')[1]);
  const nextNum = (lastNum + 1).toString().padStart(3, '0');
  return `Sanvii-${nextNum}`;
};

const createProject = async (data, createdBy) => {
  const projectId = await generateProjectId();
  const project = new Project({
    ...data,
    projectId,
    createdBy,
    createdDate: new Date()
  });
  return await project.save();
};

const updateProject = async (projectId, data) => {
  const project = await Project.findOne({ projectId });
  if (!project) throw { status: 404, message: 'Project not found' };

  project.name = data.name || project.name;
  project.startDate = data.startDate || project.startDate;
  project.endDate = data.endDate || project.endDate;
  project.description = data.description || project.description;
  project.teamMembers = data.teamMembers || project.teamMembers;
  project.updatedDate = new Date();

  return await project.save();
};

const getAllProjects = async () => {
  return await Project.find();
};

const getProjectById = async (projectId) => {
  const project = await Project.findOne({ projectId });
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
  return await Project.find({ status });
};

module.exports = {
  createProject,
  updateProject,
  getAllProjects,
  getProjectById,
  updateProjectStatus,
  getProjectsByStatus
};
