import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../../theme';
import { useFileAnalysis } from '../../contexts/FileAnalysisContext';
import { keyframes } from '@emotion/react';

// Keyframe animations
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Container for the entire errors section
const ErrorsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 1.5rem;
  overflow: auto;
  margin-bottom: 1.5rem;
`;

// Container for the list of error widgets
const ErrorList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
`;

// Loading and empty state item
const ErrorItem = styled(motion.div)`
  background-color: var(--color-cardBackground, ${theme.colors.cardBackground});
  border-radius: ${theme.borderRadius.medium};
  padding: 1rem;
  margin-bottom: 1rem;
`;

const ErrorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ErrorType = styled.span`
  color: var(--color-error, ${theme.colors.error});
  font-weight: 600;
`;

const ErrorMessage = styled.div`
  color: var(--color-text, ${theme.colors.text});
  font-size: 0.9rem;
`;

// Container for no errors message
const NoErrorsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  text-align: center;
`;

const NoErrorsMessage = styled.div`
  color: var(--color-success, ${theme.colors.success});
  font-size: 1.2rem;
  margin-bottom: 1rem;
`;

const NoErrorsExplanation = styled.div`
  color: var(--color-text, ${theme.colors.text});
  white-space: pre-wrap;
  line-height: 1.6;
  max-width: 800px;
  text-align: left;
`;

// Individual error widget
const ErrorWidget = styled(motion.div)<{ isPotential: boolean }>`
  background-color: var(--color-cardBackground, ${theme.colors.cardBackground});
  border-radius: ${theme.borderRadius.medium};
  padding: 1.5rem;
  border: 1px solid var(--color-border, ${theme.colors.border});
  border-left: 6px solid ${props => props.isPotential ? '#FFA500' : '#FF0000'};
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const ErrorWidgetHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ErrorWidgetType = styled.span<{ isPotential: boolean }>`
  color: ${props => props.isPotential ? '#FFA500' : '#FF0000'};
  font-weight: 600;
  font-size: 1.1rem;
`;

const ErrorWidgetLine = styled.span`
  color: var(--color-textSecondary, ${theme.colors.textSecondary});
  font-size: 0.9rem;
  background-color: var(--color-hover, ${theme.colors.hover});
  padding: 0.25rem 0.5rem;
  border-radius: ${theme.borderRadius.small};
`;

const ErrorWidgetContent = styled.div`
  color: var(--color-text, ${theme.colors.text});
  line-height: 1.6;
  white-space: pre-wrap;
  margin-bottom: 1rem;
`;

const ErrorWidgetFix = styled.div`
  padding: 1rem;
  background-color: var(--color-hover, ${theme.colors.hover});
  border-radius: ${theme.borderRadius.small};
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  border-left: 3px solid var(--color-primary, ${theme.colors.primary});
`;

const PotentialErrorBadge = styled.span`
  background-color: #FFA500;
  color: white;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: ${theme.borderRadius.small};
  margin-left: 0.5rem;
`;

// Loading spinner
const LoadingSpinner = styled(motion.div)`
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-primary, ${theme.colors.primary});
  border-radius: 50%;
  border-top-color: transparent;
  animation: ${spin} 1s linear infinite;
  margin: 0 auto;
`;

const LoadingText = styled.p`
  color: var(--color-textSecondary, ${theme.colors.textSecondary});
  text-align: center;
  margin-top: 1rem;
`;

// Modal for detailed error view
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background-color: var(--color-cardBackground, ${theme.colors.cardBackground});
  border-radius: ${theme.borderRadius.medium};
  padding: 2rem;
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  color: var(--color-text, ${theme.colors.text});
  margin-bottom: 1rem;
`;

const ModalSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  color: var(--color-text, ${theme.colors.text});
  margin-bottom: 0.5rem;
`;

const SectionContent = styled.div`
  color: var(--color-textSecondary, ${theme.colors.textSecondary});
  line-height: 1.6;
  white-space: pre-wrap;
`;

// Error interface
interface ErrorInfo {
  line: string;
  type: string;
  description: string;
  isPotential: boolean;
  solution?: string;
  predictedFix?: string;
  predictedBehavior?: string;
  codeSnippet?: string;
  notInCode?: boolean;
  index?: number;
}

// API Error interface (matches what comes from the backend)
interface APIError {
  line?: number;
  type?: string;
  description?: string;
  solution?: string;
  isPotential?: boolean;
  index?: number;
}

const Errors: React.FC = () => {
  const { analysis, isModelLoaded, isLoading } = useFileAnalysis();
  const [selectedError, setSelectedError] = useState<number | null>(null);
  const [errorsList, setErrorsList] = useState<ErrorInfo[]>([]);
  const [noErrorsText, setNoErrorsText] = useState<string>("");

  // Extract errors from the analysis response
  useEffect(() => {
    console.log("Analysis updated:", analysis);
    
    // For debugging - log what we received
    if (analysis) {
      console.log("Analysis object received:", analysis);
      console.log("Errors array:", analysis.errors);
      console.log("Explanation:", analysis.explanation?.substring(0, 100) + "...");
    }
    
    if (analysis) {
      // First check if we have errors array directly from the API
      if (analysis.errors && analysis.errors.length > 0) {
        console.log("Using errors directly from API response:", analysis.errors);
        
        // Sort errors by line number if possible
        const sortedErrors = [...analysis.errors].sort((a, b) => {
          const lineA = a.line || 999999;
          const lineB = b.line || 999999;
          return lineA - lineB;
        });

        console.log("Sorted errors:", sortedErrors);
        
        const formattedErrors: ErrorInfo[] = [];
        
        // Process each error from the API
        for (let i = 0; i < sortedErrors.length; i++) {
          const err = sortedErrors[i];
          
          // Fix for errors that have malformed types
          let errorType = err.type || "Error";
          let errorDesc = err.description || "";
          let errorSolution = err.solution || "";
          
          // Check if we have a malformed type field that contains type + description
          if (errorType.includes("Description")) {
            // Split the type field to extract actual type
            const parts = errorType.split(/\s*-\s*Description/);
            errorType = parts[0].trim();
            
            // If description field was mixed with type, extract it
            if (parts.length > 1) {
              errorDesc = parts[1].trim() + (errorDesc ? " " + errorDesc : "");
            }
          }
          
          // Check if description field has solution info at the end
          if (errorDesc.includes("Fix:") || errorDesc.includes("Solution:")) {
            const fixParts = errorDesc.split(/\s*-\s*(?:Fix|Solution):/);
            if (fixParts.length > 1) {
              errorDesc = fixParts[0].trim();
              errorSolution = fixParts[1].trim() + (errorSolution ? " " + errorSolution : "");
            }
          }
          
          // Check for potential error marker in API error or inside the type string
          const isPotential = err.isPotential === true || 
                            errorType.toLowerCase().includes('potential') || 
                            errorType.toLowerCase().includes('warning');
          
          formattedErrors.push({
            line: err.line ? err.line.toString() : "?",
            type: errorType,
            description: errorDesc,
            isPotential: isPotential,
            solution: errorSolution,
            index: i
          });
        }
        
        console.log("Formatted errors count:", formattedErrors.length);
        console.log("Formatted errors from API:", formattedErrors);
        setErrorsList(formattedErrors);
      } 
      // If no errors array or it's empty, try extracting numbered errors directly from the explanation text
      else if (analysis.explanation && analysis.explanation.includes("### ERRORS")) {
        console.log("No errors in API response, trying to parse from explanation with ### ERRORS section");
        parseAnalysis(analysis.explanation);
      }
      // Try to extract numbered errors directly from explanation in a different format
      else if (analysis.explanation && 
              (analysis.explanation.match(/\d+\.\s+Line\s+\d+:/) || 
               analysis.explanation.match(/\(\s*Potential\s+error\s*\)\s+Line\s+\d+:/))) {
        console.log("Trying to extract numbered errors directly from explanation");
        
        const errors: ErrorInfo[] = [];
        
        // Use a regex that matches patterns like "1. Line 10:" or "(Potential error) Line 13:"
        const errorRegex = /(?:\d+\.\s+|\(\s*Potential\s+error\s*\)\s+)Line\s+(\d+):.*?(?=(?:\d+\.\s+|\(\s*Potential\s+error\s*\)\s+)Line\s+\d+:|$)/gs;
        
        let errorMatches;
        let index = 0;
        
        // Find all matching error blocks
        while ((errorMatches = errorRegex.exec(analysis.explanation)) !== null) {
          const errorBlock = errorMatches[0];
          console.log("Found error block:", errorBlock);
          
          // Check if this is a potential error
          const isPotential = errorBlock.toLowerCase().includes('potential error');
          
          // Extract line number
          const lineMatch = errorBlock.match(/Line\s+(\d+)/i);
          const lineNumber = lineMatch ? lineMatch[1] : "?";
          
          // Extract error type
          let errorType = "Error";
          const typeMatch = errorBlock.match(/Type\s+of\s+error:\s+([^\n]+)/i);
          if (typeMatch) {
            errorType = typeMatch[1].trim();
          }
          
          // Extract description
          let description = "";
          const descMatch = errorBlock.match(/Description:\s+([^\n]+(?:\n\s+[^\n]+)*)/i);
          if (descMatch) {
            description = descMatch[1].trim();
          }
          
          // Extract solution
          let solution = "";
          const fixMatch = errorBlock.match(/Fix:\s+([^\n]+(?:\n\s+[^\n]+)*)/i);
          if (fixMatch) {
            solution = fixMatch[1].trim();
          }
          
          errors.push({
            line: lineNumber,
            type: errorType,
            description: description,
            isPotential: isPotential,
            solution: solution,
            index: index++
          });
        }
        
        if (errors.length > 0) {
          console.log("Extracted errors directly from explanation:", errors);
          setErrorsList(errors);
        } else {
          // If direct extraction failed, fall back to regular parsing
          parseAnalysis(analysis.explanation);
        }
      }
      // Otherwise use the regular parsing logic
      else if (analysis.explanation) {
        console.log("No errors in API response, trying to parse from explanation");
        parseAnalysis(analysis.explanation);
      } else {
        console.log("No analysis data to display errors");
        setErrorsList([]);
        setNoErrorsText("No errors found in the code analysis.");
      }
    }
  }, [analysis]);

  // Parse the analysis response to extract errors and explanations
  const parseAnalysis = (text: string) => {
    console.log("Parsing analysis text:", text);
    
    try {
      // Try to match both standard and numbered error section formats
      const errorsSection = extractErrorsSection(text);
      
      if (!errorsSection) {
        console.log("No ERRORS section found in analysis");
        setErrorsList([]);
        setNoErrorsText("No errors found in the code analysis.");
        return;
      }

      // Check if the errors section indicates no errors
      if (errorsSection.toLowerCase().includes("there are no syntax errors") || 
          errorsSection.toLowerCase().includes("no errors found") ||
          errorsSection.toLowerCase().includes("code is correct")) {
        console.log("No errors found message detected");
        setErrorsList([]);
        setNoErrorsText(errorsSection);
        return;
      }

      // Try different parsing strategies
      let errors: ErrorInfo[] = [];
      
      // Try numbered format first (1. Line 10: `terms = 5;`)
      errors = parseNumberedErrors(errorsSection);
      
      // If no errors found, try hyphen/bullet format (- Line 10: `terms = 5;`)
      if (errors.length === 0) {
        errors = parseHyphenErrors(errorsSection);
      }
      
      // If still no errors, try alternative format
      if (errors.length === 0) {
        errors = parseAlternativeFormat(errorsSection);
      }
      
      console.log("Parsed errors:", errors);
      setErrorsList(errors);
      
      if (errors.length === 0) {
        setNoErrorsText("The analysis found no specific errors to report.");
      }
    } catch (error) {
      console.error("Error parsing analysis:", error);
      setErrorsList([]);
      setNoErrorsText("Error parsing the code analysis response.");
    }
  };

  // Extract the errors section from different format variations
  const extractErrorsSection = (text: string): string | null => {
    // Try to match standard format: ### ERRORS
    const standardMatch = text.match(/### ERRORS\s*\n([\s\S]*?)(?=###|$)/);
    if (standardMatch && standardMatch[1]) {
      return standardMatch[1].trim();
    }
    
    // Try to match numbered format: ### 2. ERRORS
    const numberedMatch = text.match(/###\s*\d+\.\s*ERRORS\s*\n([\s\S]*?)(?=###|$)/) || 
                         text.match(/###\s*ERRORS\s*\n([\s\S]*?)(?=###|$)/);
    if (numberedMatch && numberedMatch[1]) {
      return numberedMatch[1].trim();
    }
    
    // If the text contains an ERRORS heading without the ### formatting
    const simpleMatch = text.match(/ERRORS[:\s]*\n([\s\S]*?)(?=\n\n\w|$)/i);
    if (simpleMatch && simpleMatch[1]) {
      return simpleMatch[1].trim();
    }
    
    // If no structured format is found and the text mentions errors directly
    if (text.toLowerCase().includes("error:") || 
        text.toLowerCase().includes("line") && text.toLowerCase().includes("error")) {
      return text;
    }
    
    return null;
  };

  // Parse errors in the numbered format (1., 2., etc.)
  const parseNumberedErrors = (text: string) => {
    const errors: ErrorInfo[] = [];
    
    // Split the text by numbered patterns (including variations)
    const errorBlocks = text.split(/(?=\d+\.\s+)/);
    
    for (const block of errorBlocks) {
      if (!block.trim()) continue;
      
      console.log("Parsing numbered block:", block);
      
      // Check if this is a potential error by examining the first line
      let isPotential = block.toLowerCase().includes('potential error') || 
                        block.toLowerCase().includes('possible error') ||
                        block.toLowerCase().includes('(potential error)');
      
      // Try to extract the line number
      let lineNumber = "?";
      const lineMatch = block.match(/Line\s+(\d+)/i) || block.match(/line\s*(\d+)/i) || block.match(/at\s+line\s*(\d+)/i);
      if (lineMatch) {
        lineNumber = lineMatch[1];
      }
      
      // Extract error type
      let errorType = "Unknown Error";
      const typeMatch = block.match(/Type\s+of\s+error:\s+([^\n]+)/i) || 
                       block.match(/Error\s+Type:\s+([^\n]+)/i) ||
                       block.match(/Issue\s+Type:\s+([^\n]+)/i);
      
      if (typeMatch) {
        errorType = typeMatch[1].trim();
        // Also check if there's a "potential" in the error type
        isPotential = isPotential || 
                      errorType.toLowerCase().includes('potential') || 
                      (typeMatch[2] ? typeMatch[2].toLowerCase().includes('potential') : false);
      } else {
        // Try to extract error type from the first line
        const firstLine = block.split('\n')[0].trim();
        if (firstLine && !firstLine.match(/^\d+[\.\)]/) && !firstLine.toLowerCase().includes('line')) {
          // Remove the number prefix
          errorType = firstLine.replace(/^\d+[\.\)]\s*/, '').trim();
        }
      }
      
      // Extract description
      let description = "";
      const descMatch = block.match(/Description:\s+([^\n]+(?:\n\s+[^\n]+)*)/i) || 
                       block.match(/Problem:\s+([^\n]+(?:\n\s+[^\n]+)*)/i) ||
                       block.match(/Issue:\s+([^\n]+(?:\n\s+[^\n]+)*)/i);
      
      if (descMatch) {
        description = descMatch[1].trim();
      } else {
        // If no specific description match, use everything after the first line
        // that isn't part of other sections
        const lines = block.split('\n');
        if (lines.length > 1) {
          const remainingLines = lines.slice(1).filter(line => 
            !line.match(/^\s*(Fix|Solution|Type|Line):/i)
          );
          if (remainingLines.length > 0) {
            description = remainingLines.join('\n').trim();
          }
        }
      }
      
      // Extract fix/solution
      let solution = "";
      const fixMatch = block.match(/Fix:\s+([^\n]+(?:\n\s+[^\n]+)*)/i) || 
                      block.match(/Solution:\s+([^\n]+(?:\n\s+[^\n]+)*)/i) ||
                      block.match(/How\s+to\s+fix:\s+([^\n]+(?:\n\s+[^\n]+)*)/i);
      
      if (fixMatch) {
        solution = fixMatch[1].trim();
      }
      
      // Check if error is marked as not in the code
      const notInCode = block.toLowerCase().includes('not in the provided code') || 
                       block.toLowerCase().includes('not in provided code') ||
                       block.toLowerCase().includes('not present in the code');
      
      console.log(`Found Numbered Error: Line ${lineNumber}, Type: ${errorType}, Potential: ${isPotential}`);
      
      errors.push({
        line: lineNumber,
        type: errorType,
        description: description || "No description provided",
        isPotential: isPotential,
        solution: solution,
        notInCode: notInCode
      });
    }
    
    return errors;
  };

  // Parse errors in the hyphen format
  const parseHyphenErrors = (text: string) => {
    const lines = text.split('\n');
    const errors: ErrorInfo[] = [];
    
    let currentError: Partial<ErrorInfo> | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) continue;
      
      console.log(`Parsing line: "${line}"`);
      
      // Check for regular error pattern: "- Line X: `ErrorType`"
      const regularErrorMatch = line.match(/^-\s*Line\s+(\d+):\s*`?([^`]+)`?/i) ||
                               line.match(/^-\s*At\s+line\s+(\d+):\s*`?([^`]+)`?/i);
      
      // Check for potential error pattern: "- Potential error (Line X): `ErrorType`"
      const potentialErrorMatch = line.match(/^-\s*Potential\s+error\s*\(Line\s+(\d+)\):\s*`?([^`]+)`?/i) ||
                                 line.match(/^-\s*Possible\s+error\s*\(Line\s+(\d+)\):\s*`?([^`]+)`?/i);
      
      if (regularErrorMatch || potentialErrorMatch) {
        // If we already had an error, push it before starting a new one
        if (currentError && currentError.line && currentError.type) {
          errors.push({
            line: currentError.line,
            type: currentError.type,
            description: currentError.description || "No description provided",
            isPotential: currentError.isPotential || false,
            solution: currentError.solution || ""
          });
        }
        
        // Start a new error
        let lineNumber, errorType, isPotential;
        
        if (regularErrorMatch) {
          lineNumber = regularErrorMatch[1];
          errorType = regularErrorMatch[2].trim();
          isPotential = false;
        } else {
          lineNumber = potentialErrorMatch![1];
          errorType = potentialErrorMatch![2].trim();
          isPotential = true;
        }
        
        currentError = {
          line: lineNumber,
          type: errorType,
          isPotential: isPotential,
        };
        
        console.log(`Found ${isPotential ? 'Potential' : 'Regular'} Error: Line ${lineNumber}, Type: ${errorType}`);
      } 
      // Check for description line: "  - Description: ..."
      else if (line.match(/^\s*-\s*Description:/i) && currentError) {
        const description = line.replace(/^\s*-\s*Description:\s*/i, '').trim();
        currentError.description = description;
      }
      // Check for solution/fix line
      else if (line.match(/^\s*-\s*Fix:/i) && currentError) {
        const solution = line.replace(/^\s*-\s*Fix:\s*/i, '').trim();
        currentError.solution = solution;
      }
      // Check for solution/fix line alternative format
      else if (line.match(/^\s*-\s*Solution:/i) && currentError) {
        const solution = line.replace(/^\s*-\s*Solution:\s*/i, '').trim();
        currentError.solution = solution;
      }
      // If line starts with "- " but doesn't match other patterns, it might be a new error without explicit line number
      else if (line.match(/^-\s+/) && !line.match(/^\s*-\s*/) && (currentError === null || (currentError.type && currentError.description))) {
        // If we already had an error, push it before starting a new one
        if (currentError && currentError.line && currentError.type) {
          errors.push({
            line: currentError.line,
            type: currentError.type,
            description: currentError.description || "No description provided",
            isPotential: currentError.isPotential || false,
            solution: currentError.solution || ""
          });
        }
        
        // Extract type from this line
        const content = line.replace(/^-\s+/, '').trim();
        currentError = {
          line: "?", // Unknown line
          type: content,
          isPotential: content.toLowerCase().includes('potential') || content.toLowerCase().includes('possible'),
          description: ""
        };
      }
      // If this is a continuation of a description or other section
      else if (currentError && currentError.type && !currentError.description) {
        // If no description yet, assume this line is part of the description
        currentError.description = (currentError.description || "") + line;
      }
    }
    
    // Don't forget to add the last error if there is one
    if (currentError && currentError.line && currentError.type) {
      errors.push({
        line: currentError.line,
        type: currentError.type,
        description: currentError.description || "No description provided",
        isPotential: currentError.isPotential || false,
        solution: currentError.solution || ""
      });
    }
    
    return errors;
  };

  // Parse errors in alternative formats
  const parseAlternativeFormat = (text: string) => {
    const errors: ErrorInfo[] = [];
    
    // Try to identify errors based on keywords like "error", "issue", "problem"
    const paragraphs = text.split(/\n\s*\n/);
    
    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) continue;
      
      console.log("Parsing alternative paragraph:", paragraph);
      
      let isPotential = paragraph.toLowerCase().includes('potential') || 
                       paragraph.toLowerCase().includes('possible') ||
                       paragraph.toLowerCase().includes('might be');
      
      // Try to extract line number
      let lineNumber = "?";
      const lineMatch = paragraph.match(/line\s+(\d+)/i) || 
                       paragraph.match(/line:\s*(\d+)/i) ||
                       paragraph.match(/at\s+line\s+(\d+)/i);
      
      if (lineMatch) {
        lineNumber = lineMatch[1];
      }
      
      // Try to extract error type
      let errorType = "Error";
      
      // If paragraph contains certain keywords, use them to form the error type
      if (paragraph.toLowerCase().includes('syntax error')) {
        errorType = "Syntax Error";
      } else if (paragraph.toLowerCase().includes('runtime error') || paragraph.toLowerCase().includes('runtime exception')) {
        errorType = "Runtime Error";
      } else if (paragraph.toLowerCase().includes('logical error') || paragraph.toLowerCase().includes('logic error')) {
        errorType = "Logical Error";
      } else if (paragraph.toLowerCase().includes('type error')) {
        errorType = "Type Error";
      } else if (paragraph.toLowerCase().includes('reference error')) {
        errorType = "Reference Error";
      } else if (paragraph.toLowerCase().includes('import error') || paragraph.toLowerCase().includes('module not found')) {
        errorType = "Import Error";
      }
      
      // Extract description - use the whole paragraph if no clear sections
      let description = paragraph;
      
      // But try to find explicit description sections first
      const descMatch = paragraph.match(/description:\s+([^\n]+)/i) ||
                       paragraph.match(/issue:\s+([^\n]+)/i) ||
                       paragraph.match(/problem:\s+([^\n]+)/i);
      
      if (descMatch) {
        description = descMatch[1].trim();
      }
      
      // Extract solution if available
      let solution = "";
      const fixMatch = paragraph.match(/fix:\s+([^\n]+)/i) ||
                     paragraph.match(/solution:\s+([^\n]+)/i) ||
                     paragraph.match(/how to fix:\s+([^\n]+)/i) ||
                     paragraph.match(/to fix this:\s+([^\n]+)/i);
      
      if (fixMatch) {
        solution = fixMatch[1].trim();
      }
      
      // Check if error is marked as not in the code
      const notInCode = paragraph.toLowerCase().includes('not in the provided code') || 
                       paragraph.toLowerCase().includes('not in provided code') ||
                       paragraph.toLowerCase().includes('not present in the code');
      
      console.log(`Found Alternative Error: Line ${lineNumber}, Type: ${errorType}, Potential: ${isPotential}`);
      
      errors.push({
        line: lineNumber,
        type: errorType,
        description: description,
        isPotential: isPotential,
        solution: solution,
        notInCode: notInCode
      });
    }
    
    return errors;
  };

  const handleErrorClick = (index: number) => {
    setSelectedError(index);
  };

  const handleCloseModal = () => {
    setSelectedError(null);
  };
  
  return (
    <ErrorsContainer>
      {isLoading ? (
        <ErrorItem>
          <ErrorHeader>
            <ErrorType>Analyzing Code</ErrorType>
          </ErrorHeader>
          <LoadingSpinner />
          <LoadingText>Analyzing Code...</LoadingText>
        </ErrorItem>
      ) : !isModelLoaded ? (
        <ErrorItem>
          <ErrorHeader>
            <ErrorType>System Error</ErrorType>
          </ErrorHeader>
          <ErrorMessage>The analysis model is not loaded. Please ensure the model file is in the correct location.</ErrorMessage>
        </ErrorItem>
      ) : !analysis ? (
        <ErrorItem>
          <ErrorHeader>
            <ErrorType>No File Selected</ErrorType>
          </ErrorHeader>
          <ErrorMessage>Open a file in the Sources tab to see error analysis.</ErrorMessage>
        </ErrorItem>
      ) : errorsList.length === 0 ? (
        <NoErrorsContainer>
          <NoErrorsMessage>There are no errors in this code.</NoErrorsMessage>
          {noErrorsText && (
            <NoErrorsExplanation>
              {noErrorsText}
            </NoErrorsExplanation>
          )}
        </NoErrorsContainer>
      ) : (
        <ErrorList>
          <div style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>
            <h3>Found {errorsList.length} {errorsList.length === 1 ? 'error' : 'errors'}</h3>
          </div>
          {errorsList.map((error, index) => (
            <ErrorWidget
              key={index}
              onClick={() => handleErrorClick(index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              isPotential={error.isPotential}
            >
              <ErrorWidgetHeader>
                <ErrorWidgetType isPotential={error.isPotential}>
                  {error.type}
                  {error.isPotential && <PotentialErrorBadge>Potential</PotentialErrorBadge>}
                  {error.notInCode && 
                    <span style={{ 
                      backgroundColor: '#808080', 
                      color: 'white', 
                      fontSize: '0.8rem', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '0.25rem', 
                      marginLeft: '0.5rem' 
                    }}>
                      Not in code
                    </span>
                  }
                </ErrorWidgetType>
                <ErrorWidgetLine>Line {error.line}</ErrorWidgetLine>
              </ErrorWidgetHeader>
              {error.codeSnippet && (
                <div style={{ 
                  backgroundColor: 'var(--color-hover)', 
                  padding: '0.75rem', 
                  borderRadius: '0.25rem', 
                  fontFamily: 'monospace', 
                  marginBottom: '1rem',
                  fontSize: '0.9rem'
                }}>
                  {error.codeSnippet}
                </div>
              )}
              <ErrorWidgetContent>
                {error.description}
              </ErrorWidgetContent>
              {error.solution && (
                <ErrorWidgetFix>
                  {error.solution}
                </ErrorWidgetFix>
              )}
            </ErrorWidget>
          ))}
        </ErrorList>
      )}

      <AnimatePresence>
        {selectedError !== null && errorsList[selectedError] && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalTitle style={{ color: errorsList[selectedError].isPotential ? '#FFA500' : '#FF0000' }}>
                {errorsList[selectedError].type}
                {errorsList[selectedError].isPotential && <PotentialErrorBadge>Potential</PotentialErrorBadge>}
                {errorsList[selectedError].notInCode && 
                  <span style={{ 
                    backgroundColor: '#808080', 
                    color: 'white', 
                    fontSize: '0.8rem', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '0.25rem', 
                    marginLeft: '0.5rem' 
                  }}>
                    Not in code
                  </span>
                }
              </ModalTitle>
              
              <ModalSection>
                <SectionTitle>Line Number</SectionTitle>
                <SectionContent>Line {errorsList[selectedError].line}</SectionContent>
              </ModalSection>
              
              {errorsList[selectedError].codeSnippet && (
                <ModalSection>
                  <SectionTitle>Code Snippet</SectionTitle>
                  <SectionContent>
                    <pre style={{ backgroundColor: 'var(--color-hover)', padding: '1rem', borderRadius: '0.25rem' }}>
                      {errorsList[selectedError].codeSnippet}
                    </pre>
                  </SectionContent>
                </ModalSection>
              )}
              
              <ModalSection>
                <SectionTitle>Description</SectionTitle>
                <SectionContent>{errorsList[selectedError].description}</SectionContent>
              </ModalSection>

              {errorsList[selectedError].solution && (
                <ModalSection>
                  <SectionTitle>Solution</SectionTitle>
                  <SectionContent>{errorsList[selectedError].solution}</SectionContent>
                </ModalSection>
              )}
              
              {errorsList[selectedError].predictedFix && (
                <ModalSection>
                  <SectionTitle>Predicted Fix</SectionTitle>
                  <SectionContent>
                    <pre style={{ backgroundColor: 'var(--color-hover)', padding: '1rem', borderRadius: '0.25rem' }}>
                      {errorsList[selectedError].predictedFix}
                    </pre>
                  </SectionContent>
                </ModalSection>
              )}
              
              {errorsList[selectedError].predictedBehavior && (
                <ModalSection>
                  <SectionTitle>Predicted Behavior</SectionTitle>
                  <SectionContent>{errorsList[selectedError].predictedBehavior}</SectionContent>
                </ModalSection>
              )}
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </ErrorsContainer>
  );
};

export default Errors; 