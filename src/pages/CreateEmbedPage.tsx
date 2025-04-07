import React, { useEffect, useState } from "react";
import { useQueryParams, EmbedOptions, DEFAULT_OPTIONS } from "../hooks/useQueryParams";
import { ChallengeFile } from "../types/challenge";

// Default file templates
const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Custom Assignment</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Custom Assignment</h1>
  <div id="app"></div>
  <script src="script.js"></script>
</body>
</html>`;

const DEFAULT_CSS = `body {
  font-family: sans-serif;
  margin: 20px;
  background-color: #f5f5f5;
}

h1 {
  color: #333;
}`;

const DEFAULT_JS = `// JavaScript code here
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  app.textContent = 'Hello from JavaScript!';
});`;

interface CustomAssignment {
  title: string;
  assignment: string;
  maxScore: number;
  files: ChallengeFile[];
  mainFile: string;
  previewType: string;
}

const CreateEmbedPage: React.FC = () => {
  const { customData } = useQueryParams();
  const [assignment, setAssignment] = useState<CustomAssignment>({
    title: "Custom Assignment",
    assignment: "<p>Description of your assignment</p>",
    maxScore: 0,
    files: [
      { filename: "index.html", readonly: false, hidden: false, autoreload: true, content: DEFAULT_HTML },
      { filename: "style.css", readonly: false, hidden: false, autoreload: true, content: DEFAULT_CSS },
      { filename: "script.js", readonly: false, hidden: false, autoreload: true, content: DEFAULT_JS },
    ],
    mainFile: "index.html",
    previewType: "html",
  });
  const [b64Data, setB64Data] = useState<string>("");
  const [iframeCode, setIframeCode] = useState<string>("");
  const [displayOptions, setDisplayOptions] = useState<EmbedOptions>(DEFAULT_OPTIONS);
  const [currentFile, setCurrentFile] = useState<number>(0);

  // Load data from URL if provided
  useEffect(() => {
    if (customData) {
      setAssignment({
        ...assignment,
        ...customData,
      });
    }
  }, [customData]);

  // Generate base64 data and iframe code when assignment changes
  useEffect(() => {
    try {
      const jsonData = JSON.stringify(assignment);
      const b64 = btoa(jsonData);
      setB64Data(b64);

      // Construct query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("data", b64);

      if (!displayOptions.autoReload) queryParams.append("autoReload", "false");
      if (!displayOptions.showAssignment) queryParams.append("showAssignment", "false");
      if (!displayOptions.isScored) queryParams.append("isScored", "false");
      if (!displayOptions.showEditors) queryParams.append("showEditors", "false");

      const embedUrl = `${window.location.origin}/#/embed/custom?${queryParams.toString()}`;
      const iframeHtml = `<iframe src="${embedUrl}" style="width: 100%; height: 600px; border: none;"></iframe>`;

      setIframeCode(iframeHtml);
    } catch (error) {
      console.error("Error generating embed code:", error);
    }
  }, [assignment, displayOptions]);

  // Update assignment fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAssignment((prev) => ({
      ...prev,
      [name]: name === "maxScore" ? parseInt(value) || 0 : value,
    }));
  };

  // Update file content
  const handleFileContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedFiles = [...assignment.files];
    updatedFiles[currentFile] = {
      ...updatedFiles[currentFile],
      content: e.target.value,
    };

    setAssignment((prev) => ({
      ...prev,
      files: updatedFiles,
    }));
  };

  // Add a new file
  const handleAddFile = () => {
    const filename = prompt("Enter filename (including extension):");
    if (!filename) return;

    const newFile: ChallengeFile = {
      filename,
      readonly: false,
      hidden: false,
      autoreload: true,
      content: "",
    };

    setAssignment((prev) => ({
      ...prev,
      files: [...prev.files, newFile],
    }));

    // Select the new file
    setCurrentFile(assignment.files.length);
  };

  // Delete current file
  const handleDeleteFile = () => {
    if (assignment.files.length <= 1) {
      alert("Cannot delete the last file");
      return;
    }

    if (!confirm(`Delete file ${assignment.files[currentFile].filename}?`)) return;

    const updatedFiles = assignment.files.filter((_, index) => index !== currentFile);

    // Update main file if it was the deleted one
    let mainFile = assignment.mainFile;
    if (assignment.files[currentFile].filename === assignment.mainFile) {
      mainFile = updatedFiles[0].filename;
    }

    setAssignment((prev) => ({
      ...prev,
      files: updatedFiles,
      mainFile,
    }));

    // Adjust selected file index
    setCurrentFile((prev) => Math.min(prev, updatedFiles.length - 1));
  };

  // Toggle options
  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setDisplayOptions((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Set main file
  const handleSetMainFile = () => {
    setAssignment((prev) => ({
      ...prev,
      mainFile: prev.files[currentFile].filename,
    }));
  };

  return (
    <div className="min-h-screen p-6 text-white bg-gray-900">
      <h1 className="mb-8 text-3xl font-bold">Create Custom Embeddable Assignment</h1>

      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
        {/* Assignment Details */}
        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="mb-4 text-xl font-bold">Assignment Details</h2>

          <div className="mb-4">
            <label className="block mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={assignment.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-gray-300 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Description (HTML)</label>
            <textarea
              name="assignment"
              value={assignment.assignment}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 text-gray-300 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Max Score</label>
            <input
              type="number"
              name="maxScore"
              value={assignment.maxScore}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 text-gray-300 rounded"
            />
          </div>
        </div>

        {/* Display Options */}
        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="mb-4 text-xl font-bold">Display Options</h2>

          <div className="mb-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="autoReload"
                checked={displayOptions.autoReload}
                onChange={handleOptionChange}
                className="mr-2 text-white"
              />
              Auto-reload preview
            </label>
          </div>

          <div className="mb-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="showAssignment"
                checked={displayOptions.showAssignment}
                onChange={handleOptionChange}
                className="mr-2 text-white"
              />
              Show assignment title and description
            </label>
          </div>

          <div className="mb-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isScored"
                checked={displayOptions.isScored}
                onChange={handleOptionChange}
                className="mr-2 text-white"
              />
              Enable scoring and tests
            </label>
          </div>

          <div className="mb-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="showEditors"
                checked={displayOptions.showEditors}
                onChange={handleOptionChange}
                className="mr-2 text-white"
              />
              Show code editors
            </label>
          </div>
        </div>
      </div>

      {/* Files Section */}
      <div className="p-4 mb-8 bg-gray-800 rounded-lg">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-bold">Files</h2>
          <div className="flex ml-auto">
            <button onClick={handleAddFile} className="px-3 py-1 mr-2 text-white bg-green-600 rounded hover:bg-green-700">
              Add File
            </button>
            <button onClick={handleDeleteFile} className="px-3 py-1 text-white bg-red-600 rounded hover:bg-red-700">
              Delete Current
            </button>
          </div>
        </div>

        <div className="flex mb-2 overflow-x-auto">
          {assignment.files.map((file, index) => (
            <button
              key={file.filename}
              onClick={() => setCurrentFile(index)}
              className={`px-3 py-1 mr-2 text-sm rounded-t ${index === currentFile ? "bg-blue-600" : "bg-gray-700"} ${
                file.filename === assignment.mainFile ? "font-bold" : ""
              }`}
            >
              {file.filename}
            </button>
          ))}
        </div>

        {assignment.files.length > 0 && (
          <>
            <div className="flex items-center mb-2">
              <span className="mr-2">Current file: {assignment.files[currentFile].filename}</span>
              {assignment.files[currentFile].filename !== assignment.mainFile && (
                <button
                  onClick={handleSetMainFile}
                  className="px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Set as Main File
                </button>
              )}
            </div>
            <textarea
              value={assignment.files[currentFile].content || ""}
              onChange={handleFileContentChange}
              className="w-full px-3 py-2 font-mono text-green-300 bg-gray-900 rounded"
              rows={15}
            />
          </>
        )}
      </div>

      {/* Embed Code Section */}
      <div className="p-4 mb-8 bg-gray-800 rounded-lg">
        <h2 className="mb-4 text-xl font-bold">Embed Code</h2>
        <p className="mb-4">Copy and paste this code to embed your assignment:</p>
        <textarea
          readOnly
          value={iframeCode}
          className="w-full px-3 py-2 mb-4 font-mono text-gray-200 bg-gray-900 rounded"
          rows={3}
          onClick={(e) => (e.target as HTMLTextAreaElement).select()}
        />

        <div className="flex flex-wrap gap-4">
          <a
            href={`/#/embed/custom?data=${b64Data}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Preview Assignment
          </a>

          <a href={`/#/embed/create?data=${b64Data}`} className="px-4 py-2 text-white bg-purple-600 rounded hover:bg-purple-700">
            Get Shareable Edit Link
          </a>
        </div>
      </div>
    </div>
  );
};

export default CreateEmbedPage;
