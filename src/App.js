import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'; // For syntax highlighting
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Syntax highlighting style
import './App.css'; // Import custom styles for dark mode and cleaner UI
import { FaDownload, FaTrashAlt, FaMoon, FaSun } from 'react-icons/fa'; // Import icons

const App = () => {
  const [markdownFiles, setMarkdownFiles] = useState([]);
  const [newMarkdown, setNewMarkdown] = useState({ title: '', content: '' });
  const [darkMode, setDarkMode] = useState(false); // Dark mode toggle

  useEffect(() => {
    fetchMarkdownFiles();
  }, []);

  // Fetch all markdown files
  const fetchMarkdownFiles = async () => {
    try {
      const response = await axios.get('https://shinkiro-backend.vercel.app/api/markdown');
      setMarkdownFiles(response.data);
    } catch (error) {
      console.error('Error fetching markdown files', error);
    }
  };

  // Handle form change
  const handleChange = (e) => {
    setNewMarkdown({ ...newMarkdown, [e.target.name]: e.target.value });
  };

  // Submit a new markdown file
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://shinkiro-backend.vercel.app/api/markdown', newMarkdown);
      setNewMarkdown({ title: '', content: '' });
      fetchMarkdownFiles(); // Refresh the list
    } catch (error) {
      console.error('Error submitting markdown', error);
    }
  };

  // Handle deletion of a markdown file
  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://shinkiro-backend.vercel.app/api/markdown/${id}`);
      fetchMarkdownFiles(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting markdown', error);
    }
  };

  // Handle download of markdown content as a .md file
  const handleDownload = (markdown) => {
    const element = document.createElement('a');
    const file = new Blob([markdown.content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${markdown.title}.md`;
    document.body.appendChild(element); // Required for this to work in Firefox
    element.click();
  };

  return (
    <div className={`container ${darkMode ? 'dark-mode' : ''}`} style={{ backgroundImage: 'url(/path/to/anime-background.jpg)', backgroundSize: 'cover' }}>
      <div className="header">
        <h1>蜃気楼(Mirrage) - The Markdown Manager</h1>
        <button className="toggle-dark-mode" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>
      <img src="https://giffiles.alphacoders.com/220/220341.gif" alt="Anime aesthetic" className="anime-image" />
    
      <p className="description">Create, manage, and download your markdown files!</p>

      <form onSubmit={handleSubmit} className="markdown-form">
        <input
          type="text"
          name="title"
          value={newMarkdown.title}
          onChange={handleChange}
          placeholder="Enter title"
          required
          className="input-field"
        />
        <textarea
          name="content"
          value={newMarkdown.content}
          onChange={handleChange}
          placeholder="Enter markdown content"
          required
          className="textarea-field"
        />
        <button type="submit" className="btn save-btn">Save Markdown</button>
      </form>

      <h2 className='description'>Markdown Preview</h2>
      <div className="markdown-preview">
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return inline ? (
                <code {...props}>{children}</code>
              ) : (
                <SyntaxHighlighter
                  style={solarizedlight}
                  language={match ? match[1] : 'text'}
                  PreTag="div"
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              );
            },
          }}
        >
          {newMarkdown.content}
        </ReactMarkdown>
      </div>

      <h2 className='description'>Saved Markdown Files</h2>
      <ul className="markdown-list">
        {markdownFiles.map((markdown, index) => (
          <li
            key={markdown._id}
            className={`markdown-item ${index % 2 === 0 ? 'background-card' : 'foreground-card'}`}
          >
            <div className="markdown-header">
              <h3>{markdown.title}</h3>
              <div className="markdown-actions">
                <button className="btn download-btn" onClick={() => handleDownload(markdown)}>
                  <FaDownload /> Download
                </button>
                <button className="btn delete-btn" onClick={() => handleDelete(markdown._id)}>
                  <FaTrashAlt /> Delete
                </button>
              </div>
            </div>
            <ReactMarkdown>{markdown.content}</ReactMarkdown>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
