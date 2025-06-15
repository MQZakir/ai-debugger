import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from '@emotion/styled';
import { theme } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useFileMonitor } from '../../contexts/FileMonitorContext';
import { useFileAnalysis } from '../../contexts/FileAnalysisContext';

interface SourcesProps {
  onFileSelect: (fileName: string, content: string) => void;
  selectedFile: string | null;
  selectedFileContent: string;
}

const SourcesContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  padding: 0 1.5rem;
  gap: 1rem;
  overflow: auto;
  margin-bottom: 1.5rem;
  height: calc(100vh - 200px);
`;

const SourcesTree = styled.div<{ $connected: boolean }>`
  width: 300px;
  background-color: var(--color-cardBackground, ${theme.colors.cardBackground});
  border-radius: ${theme.borderRadius.medium};
  padding: 1rem;
  overflow: auto;
  position: relative;
  border-bottom: 3px solid ${props => props.$connected ? 'var(--color-success, ' + theme.colors.success + ')' : 'var(--color-error, ' + theme.colors.error + ')'};
  border-top: 3px solid ${props => props.$connected ? 'var(--color-success, ' + theme.colors.success + ')' : 'var(--color-error, ' + theme.colors.error + ')'};
  display: flex;
  flex-direction: column;
`;

const FileTreeItem = styled.div<{ $level: number; $selected?: boolean }>`
  padding: 0.5rem 1rem;
  padding-left: ${props => props.$level * 1.5 + 1}rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  border-radius: ${theme.borderRadius.small};
  background-color: ${props => props.$selected ? 'var(--color-hover, ' + theme.colors.hover + ')' : 'transparent'};
  color: var(--color-text, ${theme.colors.text});
  word-break: break-word;
  white-space: normal;
  overflow-wrap: break-word;
  
  &:hover {
    background-color: var(--color-hover, ${theme.colors.hover});
  }
`;

const FileIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 1rem;
`;

const FolderIcon = styled(FileIcon)<{ $collapsed: boolean }>`
  cursor: pointer;
  transition: transform 0.2s ease;
  transform: ${props => props.$collapsed ? 'rotate(-90deg)' : 'rotate(0deg)'};
`;

const CodeViewer = styled.div<{ $connected: boolean }>`
  flex: 1;
  background-color: var(--color-cardBackground, ${theme.colors.cardBackground});
  border-radius: ${theme.borderRadius.medium};
  padding: 1.5rem;
  overflow: auto;
  position: relative;
  border-bottom: 3px solid ${props => props.$connected ? 'var(--color-success, ' + theme.colors.success + ')' : 'var(--color-error, ' + theme.colors.error + ')'};
  border-top: 3px solid ${props => props.$connected ? 'var(--color-success, ' + theme.colors.success + ')' : 'var(--color-error, ' + theme.colors.error + ')'};
`;

const CodeContent = styled.pre`
  margin: 0;
  padding: 0 1rem;
  background: var(--color-cardBackground, ${theme.colors.cardBackground});
  color: var(--color-text, ${theme.colors.text});
  white-space: pre;
  overflow-x: auto;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5rem;
`;

const CodeLine = styled.div`
  height: 1.5rem;
  line-height: 1.5rem;
  white-space: pre;
  position: relative;
  
  &:hover {
    background-color: var(--color-hover, ${theme.colors.hover});
  }
`;

const LineNumber = styled.span`
  color: var(--color-textSecondary, ${theme.colors.textSecondary});
  padding-right: 1rem;
  user-select: none;
`;

const WorkspaceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ConnectionControls = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 1rem;
  position: sticky;
  bottom: 0;
  background-color: var(--color-cardBackground, ${theme.colors.cardBackground});
`;

const ControlButton = styled.button<{ disabled?: boolean }>`
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: ${theme.borderRadius.small};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: ${theme.transitions.default};
  background-color: ${props => props.disabled ? 'var(--color-textSecondary, ' + theme.colors.textSecondary + ')' : 'var(--color-primary, ' + theme.colors.primary + ')'};
  color: var(--color-background, ${theme.colors.background});
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:hover {
    opacity: ${props => props.disabled ? 0.5 : 0.9};
  }
`;

const ContextMenu = styled.div<{ $x: number; $y: number }>`
  position: fixed;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  background-color: var(--color-cardBackground, ${theme.colors.cardBackground});
  border: 1px solid var(--color-border, ${theme.colors.border});
  border-radius: ${theme.borderRadius.medium};
  padding: 0.5rem;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ContextMenuItem = styled.div`
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: ${theme.borderRadius.small};
  color: var(--color-text, ${theme.colors.text});

  &:hover {
    background-color: var(--color-hover, ${theme.colors.hover});
  }
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  margin-top: 1rem;
  border: 1px solid var(--color-border, ${theme.colors.border});
  border-radius: ${theme.borderRadius.small};
  background-color: var(--color-cardBackground, ${theme.colors.cardBackground});
  color: var(--color-text, ${theme.colors.text});
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: var(--color-primary, ${theme.colors.primary});
  }
`;

const InfoBanner = styled.div`
  padding: 0.5rem;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  background-color: var(--color-hover, ${theme.colors.hover});
  border-radius: ${theme.borderRadius.small};
`;

const FilePath = styled.div`
  color: var(--color-textSecondary, ${theme.colors.textSecondary});
  font-size: 0.875rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: var(--color-hover, ${theme.colors.hover});
  border-radius: ${theme.borderRadius.small};
`;

interface FileTreeNode {
  path: string;
  name: string;
  isDirectory: boolean;
  children?: FileTreeNode[];
  isCollapsed?: boolean;
  content?: string;
  language?: string;
}

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'py': return '🐍';
    case 'js': case 'jsx': case 'ts': case 'tsx': return '📜';
    case 'html': return '🌐';
    case 'css': case 'scss': case 'sass': case 'less': return '🎨';
    case 'json': return '📦';
    case 'md': return '📝';
    case 'java': return '☕';
    case 'cpp': case 'c': case 'h': case 'hpp': return '⚡';
    case 'php': return '🐘';
    case 'rb': return '💎';
    case 'go': return '🚀';
    case 'rs': return '🦀';
    case 'swift': return '🍎';
    case 'kt': return '🤖';
    case 'sql': return '🗄️';
    case 'xml': case 'yaml': case 'yml': return '📄';
    default: return '📄';
  }
};

const Sources: React.FC<SourcesProps> = ({ onFileSelect, selectedFile, selectedFileContent }) => {
  const { isDarkMode } = useTheme();
  const { analyzeCode } = useFileAnalysis();
  const { 
    files, 
    isConnected, 
    connect, 
    disconnect, 
    toggleFolder,
    removeFile,
  } = useFileMonitor();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean; item: any }>({
    x: 0,
    y: 0,
    visible: false,
    item: null
  });
  
  // Debug Log - file list update
  useEffect(() => {
    console.log("Current files in Sources:", files);
  }, [files]);
  
  // Find the selected file from the file tree
  const findFileNode = useCallback((path: string, nodes: any[]): any => {
    for (const node of nodes) {
      if (node.path === path) {
        return node;
      }
      if (node.children) {
        const found = findFileNode(path, node.children);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }, []);

  // Handle opening a file
  const handleFileClick = useCallback(async (filePath: string) => {
    console.error('File clicked:', filePath);
    const fileNode = findFileNode(filePath, files);
    console.error('Found file node:', fileNode);
    
    if (fileNode && fileNode.content) {
      console.error('Setting selected file:', filePath);
      onFileSelect(filePath, fileNode.content);
      
      // Always analyze the file when it's clicked and has content
      console.error('Analyzing file:', filePath);
      try {
        if (fileNode.content.trim().length > 0) {
          console.error(`File has content (${fileNode.content.length} chars), analyzing...`);
          await analyzeCode(fileNode.content);
        } else {
          console.error('File is empty, skipping analysis');
        }
      } catch (error) {
        console.error('Error analyzing file:', error);
      }
    } else {
      console.error('No content found for file:', filePath);
      onFileSelect(filePath, '');
    }
  }, [files, findFileNode, onFileSelect, analyzeCode]);
  
  // Toggle a folder's collapsed state
  const handleFolderClick = useCallback((folderPath: string) => {
    toggleFolder(folderPath);
  }, [toggleFolder]);
  
  // Handle file removal
  const handleRemoveFile = useCallback((fileNode: FileTreeNode) => {
    // Remove from file tree
    removeFile(fileNode);
    
    // Clear selection if this was the selected file
    if (selectedFile === fileNode.path) {
      onFileSelect(fileNode.path, '');
    }

    // Make file unreadable by the app
    if (fileNode.content) {
      fileNode.content = '';
    }
  }, [removeFile, selectedFile, onFileSelect]);
  
  // Render file content
  const renderFileContent = () => {
    if (!selectedFile) {
      return <div>No file selected</div>;
    }
    
    const lines = selectedFileContent.split('\n');

    return (
      <>
        <FilePath>{selectedFile}</FilePath>
        <InfoBanner>File monitoring is active</InfoBanner>
        <CodeContent>
          {lines.map((line, index) => {
            const lineNumber = index + 1;
            return (
              <CodeLine key={lineNumber}>
                <LineNumber>{lineNumber}</LineNumber>
                {line || ' '}
              </CodeLine>
            );
          })}
        </CodeContent>
      </>
    );
  };
  
  const filterFileTree = useCallback((node: FileTreeNode): FileTreeNode | null => {
    if (!searchQuery) return node;

    const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (node.isDirectory) {
      const filteredChildren = node.children
        ?.map(child => filterFileTree(child))
        .filter(child => child !== null) as FileTreeNode[];

      if (filteredChildren?.length > 0 || matchesSearch) {
        return {
          ...node,
          children: filteredChildren
        };
      }
      return null;
    }

    return matchesSearch ? node : null;
  }, [searchQuery]);

  const renderFileTree = useCallback((nodes: FileTreeNode[], level: number = 0) => {
    const filteredNodes = nodes.map(node => filterFileTree(node)).filter(node => node !== null) as FileTreeNode[];
    
    return filteredNodes.map((node) => (
      <React.Fragment key={node.path}>
        <FileTreeItem
          $level={level}
          $selected={selectedFile === node.path}
          onClick={() => {
            if (!node.isDirectory) {
              handleFileClick(node.path);
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu({
              x: e.clientX,
              y: e.clientY,
              visible: true,
              item: node
            });
          }}
        >
          {node.isDirectory ? (
            <FolderIcon
              $collapsed={node.isCollapsed ?? false}
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(node.path);
              }}
            >
              📁
            </FolderIcon>
          ) : (
            <FileIcon>{getFileIcon(node.name)}</FileIcon>
          )}
          {node.name}
        </FileTreeItem>
        {node.isDirectory && !(node.isCollapsed ?? false) && node.children && (
          <div>
            {renderFileTree(node.children, level + 1)}
          </div>
        )}
      </React.Fragment>
    ));
  }, [selectedFile, handleFileClick, toggleFolder, filterFileTree]);

  return (
    <SourcesContainer>
      <SourcesTree $connected={isConnected}>
        <WorkspaceHeader>
          <h3>File Tree</h3>
        </WorkspaceHeader>
        <SearchBar
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {renderFileTree(files)}
        <ConnectionControls>
          <ControlButton
            onClick={connect}
            disabled={isConnected}
          >
            Connect
          </ControlButton>
          <ControlButton
            onClick={disconnect}
            disabled={!isConnected}
          >
            Disconnect
          </ControlButton>
        </ConnectionControls>
      </SourcesTree>
      
      <CodeViewer $connected={isConnected}>
        {renderFileContent()}
      </CodeViewer>

      {contextMenu.visible && (
        <ContextMenu $x={contextMenu.x} $y={contextMenu.y}>
          <ContextMenuItem onClick={() => {
            if (contextMenu.item) {
              handleFileClick(contextMenu.item.path);
            }
            setContextMenu({...contextMenu, visible: false});
          }}>
            Open
          </ContextMenuItem>
          <ContextMenuItem onClick={() => {
            if (contextMenu.item) {
              handleRemoveFile(contextMenu.item);
              setContextMenu({...contextMenu, visible: false});
            }
          }}>
            Remove
          </ContextMenuItem>
        </ContextMenu>
      )}
    </SourcesContainer>
  );
};

export default Sources; 