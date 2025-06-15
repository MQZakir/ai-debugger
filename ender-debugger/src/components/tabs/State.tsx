import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { theme } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useDebugger, DebuggerState } from '../../contexts/DebuggerContext';
import * as d3 from 'd3';

// Types
interface Variable {
  name: string;
  value: string;
  values: string[];
  type: string;
  color: string;
}

interface StackFrame {
  function: string;
  line: number;
  file: string;
}

interface Scope {
  name: string;
  variables: Array<{
    name: string;
    value: string;
  }>;
}

// Extend DebuggerState with our new fields
interface ExtendedDebuggerState extends DebuggerState {
  finalValue?: string;
}

// Styled Components
const StateContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 1.5rem;
  gap: 1rem;
  overflow-y: auto;
`;

const StateSection = styled.div`
  background-color: var(--color-cardBackground, ${theme.colors.cardBackground});
  border-radius: ${theme.borderRadius.medium};
  padding: 1.5rem;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h3`
  color: var(--color-text, ${theme.colors.text});
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
`;

const VariableList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const VariableItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background-color: var(--color-hover, ${theme.colors.hover});
  border-radius: ${theme.borderRadius.small};
  font-family: 'Fira Code', monospace;
`;

const VariableName = styled.div`
  width: 25%;
  font-weight: 500;
  color: var(--color-primary, ${theme.colors.primary});
`;

const VariableValue = styled.div`
  width: 50%;
  color: var(--color-text, ${theme.colors.text});
  word-break: break-all;
`;

const VariableType = styled.div`
  width: 25%;
  color: var(--color-textSecondary, ${theme.colors.textSecondary});
  text-align: right;
`;

const VariableValues = styled.span`
  color: var(--color-textSecondary, ${theme.colors.textSecondary});
  font-size: 0.85rem;
  margin-left: 0.5rem;
`;

const VariableValuesList = styled.div`
  margin-left: 1.5rem;
  border-left: 2px solid var(--color-border, ${theme.colors.border});
  padding-left: 1rem;
  font-size: 0.9rem;
`;

const VariableValueItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  color: var(--color-textSecondary, ${theme.colors.textSecondary});
`;

const ValueIndex = styled.span`
  color: var(--color-primary, ${theme.colors.primary});
  margin-right: 0.5rem;
`;

const FinalValueContainer = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background-color: var(--color-hover, ${theme.colors.hover});
  border-radius: ${theme.borderRadius.small};
  border-left: 6px solid var(--color-success, ${theme.colors.success});
  position: relative;
`;

const FinalValueTitle = styled.div`
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text, ${theme.colors.text});
  font-size: 1.1rem;
`;

const FinalValueContent = styled.div`
  font-family: 'Fira Code', monospace;
  white-space: pre-wrap;
  color: var(--color-text, ${theme.colors.text});
  line-height: 1.6;
  font-size: 1.1rem;
  padding: 0.5rem;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.1);
`;

const VisualizationContainer = styled.div`
  margin-top: 1.5rem;
`;

const TimelineGraph = styled.div`
  width: 100%;
  height: 300px;
  background-color: var(--color-hover, ${theme.colors.hover});
  border-radius: ${theme.borderRadius.small};
  overflow: hidden;
`;

const GraphLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-textSecondary, ${theme.colors.textSecondary});
`;

const ColorSwatch = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.color};
`;

const CallStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const StackFrame = styled.div`
  padding: 0.5rem;
  background-color: var(--color-hover, ${theme.colors.hover});
  border-radius: ${theme.borderRadius.small};
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
`;

const ScopeSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ScopeItem = styled.div`
  padding: 0.5rem;
  background-color: var(--color-hover, ${theme.colors.hover});
  border-radius: ${theme.borderRadius.small};
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  color: var(--color-text, ${theme.colors.text});
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: var(--color-textSecondary, ${theme.colors.textSecondary});
`;

// Main component
const State: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { state: debugState } = useDebugger();
  const debuggerState = debugState as ExtendedDebuggerState;
  const [variables, setVariables] = useState<Variable[]>([]);
  const [callStack, setCallStack] = useState<StackFrame[]>([]);
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [finalValue, setFinalValue] = useState<string>("");
  const graphRef = useRef<HTMLDivElement>(null);
  
  // Debug the finalValue
  console.log("State component: debuggerState.finalValue =", debuggerState.finalValue);
  
  // Process debug data
  useEffect(() => {
    console.log("Processing debug data, finalValue =", debuggerState.finalValue);
    
    // Process variables
    const processedVars = debuggerState.variables.map((v, index) => {
      const varValues = v.values || [v.value || ''];
      return {
        name: v.name,
        value: varValues[varValues.length - 1] || '',
        values: varValues,
        type: v.type || 'unknown',
        color: getRandomColor(index)
      } as Variable;
    });
    setVariables(processedVars);
    
    // Process call stack
    const processedStack = debuggerState.callStack.map(frame => ({
      function: frame.function || frame.name || 'unknown',
      line: frame.line || 0,
      file: frame.path || 'unknown'
    }));
    setCallStack(processedStack);
    
    // Process scopes
    if (debuggerState.additionalDebugData?.scopes) {
      setScopes(debuggerState.additionalDebugData.scopes);
    } else {
      setScopes([]);
    }
    
    // Check for finalValue in different places
    if (debuggerState.finalValue) {
      console.log("Found finalValue in debuggerState:", debuggerState.finalValue);
      setFinalValue(debuggerState.finalValue);
    } else if (debuggerState.additionalDebugData?.rawData?.finalValue) {
      console.log("Found finalValue in rawData:", debuggerState.additionalDebugData.rawData.finalValue);
      setFinalValue(debuggerState.additionalDebugData.rawData.finalValue);
    } else {
      console.log("No finalValue found in any location");
      setFinalValue("");
    }
  }, [debuggerState]);
  
  // Function to get a random color for variable visualization
  function getRandomColor(index: number): string {
    const colorPalette = [
      "#FF5252", "#2196F3", "#FFD600", "#00C853", "#AA00FF", 
      "#FF6D00", "#00B8D4", "#F50057", "#64DD17", "#304FFE",
      "#00BFA5", "#D50000", "#AEEA00", "#3D5AFE", "#FF9100",
      "#1E88E5", "#43A047", "#E53935", "#8E24AA", "#FB8C00",
      "#039BE5", "#7CB342", "#C62828", "#6A1B9A", "#EF6C00"
    ];
    
    return colorPalette[index % colorPalette.length];
  }

  // Create D3 graph to visualize variable values
  useEffect(() => {
    if (!graphRef.current || variables.length === 0) return;

    // Clear previous graph
    d3.select(graphRef.current).selectAll("*").remove();
    
    // Find variables with multiple values for timeline visualization
    const variablesWithHistory = variables.filter(v => v.values && v.values.length > 1);
    if (variablesWithHistory.length === 0) return;
    
    // Create the SVG container
    const width = graphRef.current.clientWidth;
    const height = graphRef.current.clientHeight;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const graphWidth = width - margin.left - margin.right;
    const graphHeight = height - margin.top - margin.bottom;
    
    const svg = d3.select(graphRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Set up scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(variablesWithHistory, (v) => v.values.length - 1) || 0])
      .range([0, graphWidth]);
    
    // Data preparation for y-scale
    const allValues = variablesWithHistory.flatMap(v => 
      v.values.map(val => {
        // Convert to number if possible
        if (val.toLowerCase() === 'true') return 1;
        if (val.toLowerCase() === 'false') return 0;
        const num = parseFloat(val);
        return isNaN(num) ? 0 : num;
      })
    );
    
    const yMin = d3.min(allValues) || 0;
    const yMax = d3.max(allValues) || 10;
    const padding = (yMax - yMin) * 0.1; // Add 10% padding to the top and bottom
    
    const yScale = d3.scaleLinear()
      .domain([yMin - padding, yMax + padding])
      .range([graphHeight, 0]); // Inverted for SVG coords (0 is top)
    
    // Create the axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(Math.min(variablesWithHistory[0].values.length, 10))
      .tickFormat((d) => `${d}`);
    
    const yAxis = d3.axisLeft(yScale);
    
    svg.append("g")
      .attr("transform", `translate(0,${graphHeight})`)
      .call(xAxis)
      .append("text")
      .attr("fill", "currentColor")
      .attr("x", graphWidth / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .text("Time Point");
    
    svg.append("g")
      .call(yAxis)
      .append("text")
      .attr("fill", "currentColor")
      .attr("transform", "rotate(-90)")
      .attr("y", -30)
      .attr("x", -graphHeight / 2)
      .attr("text-anchor", "middle")
      .text("Value");
    
    // Create a line generator
    const line = d3.line<[number, number]>()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(d3.curveMonotoneX); // Smooth curve
    
    // Draw lines for each variable
    variablesWithHistory.forEach(variable => {
      // Convert variable values to numbers for plotting
      const points: [number, number][] = variable.values.map((val, i) => {
        // Convert to number if possible
        let value: number;
        if (val.toLowerCase() === 'true') value = 1;
        else if (val.toLowerCase() === 'false') value = 0;
        else {
          const num = parseFloat(val);
          value = isNaN(num) ? 0 : num;
        }
        
        return [xScale(i), yScale(value)];
      });
      
      // Draw the path
      svg.append("path")
        .datum(points)
        .attr("fill", "none")
        .attr("stroke", variable.color)
        .attr("stroke-width", 2)
        .attr("d", line)
        .attr("class", "variable-line");
      
      // Add points at each data point
      svg.selectAll(`.point-${variable.name.replace(/[^a-zA-Z0-9]/g, '')}`)
        .data(points)
        .enter()
        .append("circle")
        .attr("class", `point-${variable.name.replace(/[^a-zA-Z0-9]/g, '')}`)
        .attr("cx", (d) => d[0])
        .attr("cy", (d) => d[1])
        .attr("r", 4)
        .attr("fill", variable.color)
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .append("title")
        .text((d, i) => `${variable.name}: ${variable.values[i]}`);
    });
    
    // Add a grid for easier reading
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${graphHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-graphHeight)
        .tickFormat(() => '')
      )
      .attr("color", "rgba(255,255,255,0.1)")
      .attr("stroke-dasharray", "2,2");
    
    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-graphWidth)
        .tickFormat(() => '')
      )
      .attr("color", "rgba(255,255,255,0.1)")
      .attr("stroke-dasharray", "2,2");
    
  }, [variables, isDarkMode]);

  // Empty state when no debug data is available
  if (variables.length === 0 && callStack.length === 0) {
    return (
      <StateContainer>
        <EmptyState>
          <p>No state information available.</p>
          <p>Select a file in the Sources tab and click "Start Debugging" to see state information.</p>
        </EmptyState>
      </StateContainer>
    );
  }

  return (
    <StateContainer>
      <StateSection>
        <SectionTitle>Variable State</SectionTitle>
        {variables.length > 0 ? (
          <VariableList>
            {variables.map((variable, index) => (
              <VariableItem key={index}>
                <VariableName>{variable.name}</VariableName>
                <VariableValue>
                  {variable.value}
                  {variable.values.length > 1 && (
                    <VariableValues>
                      (all values: {variable.values.join(', ')})
                    </VariableValues>
                  )}
                </VariableValue>
                <VariableType>{variable.type}</VariableType>
              </VariableItem>
            ))}
          </VariableList>
        ) : (
          <EmptyState>No variable data available</EmptyState>
        )}
        
        {variables.some(v => v.values.length > 1) && (
          <VisualizationContainer>
            <SectionTitle>Variable Changes Over Time</SectionTitle>
            <TimelineGraph ref={graphRef} />
            <GraphLegend>
              {variables.filter(v => v.values.length > 1).map((v, i) => (
                <LegendItem key={i}>
                  <ColorSwatch color={v.color} />
                  {v.name}
                </LegendItem>
              ))}
            </GraphLegend>
          </VisualizationContainer>
        )}
        
        {/* Final Value inside the Variable State section */}
        {finalValue ? (
          <FinalValueContainer>
            <FinalValueTitle>Program Output</FinalValueTitle>
            <FinalValueContent>
              {finalValue}
            </FinalValueContent>
          </FinalValueContainer>
        ) : (
          <div style={{ marginTop: '1rem' }}>
            <span style={{ color: 'gray', fontStyle: 'italic' }}>
              No final output value available
            </span>
          </div>
        )}
      </StateSection>
      
      <StateSection>
        <SectionTitle>Call Stack</SectionTitle>
        {callStack.length > 0 ? (
          <CallStack>
            {callStack.map((frame, index) => (
              <StackFrame key={index}>
                {frame.function} (line {frame.line})
                {frame.file !== 'unknown' && ` in ${frame.file}`}
              </StackFrame>
            ))}
          </CallStack>
        ) : (
          <EmptyState>No call stack data available</EmptyState>
        )}
      </StateSection>

      <StateSection>
        <SectionTitle>Scopes</SectionTitle>
        {scopes.length > 0 ? (
          <ScopeSection>
            {scopes.map((scope, index) => (
              <div key={index}>
                <h4>{scope.name}</h4>
                {scope.variables.map((v, vIndex) => (
                  <ScopeItem key={vIndex}>
                    {v.name}: {v.value}
                  </ScopeItem>
                ))}
              </div>
            ))}
          </ScopeSection>
        ) : (
          <EmptyState>No scope data available</EmptyState>
        )}
      </StateSection>
    </StateContainer>
  );
};

export default State; 