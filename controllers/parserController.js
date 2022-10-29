import asyncHandler from 'express-async-handler'
const { AffindaCredential, AffindaAPI } = require('@affinda/affinda')
const fs = require('fs')

// @desc    Parse Resume through Affinda API
// @route   POST /api/parse
// @access  Private

const resumeParser = asyncHandler(async (req, res) => {})

export { resumeParser }
