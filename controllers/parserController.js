import asyncHandler from 'express-async-handler'
import { AffindaAPI, AffindaCredential } from '@affinda/affinda'
import fs from 'fs'

// @desc    Parse Resume through Affinda API
// @route   POST /api/parse
// @access  Private

const resumeParser = asyncHandler(async (req, res) => {})

export { resumeParser }
