import React, { useState, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Upload, message } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';

const RichTextEditor = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false);

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    
    input.onchange = async () => {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('image', file);

      setLoading(true);
      try {
        // Replace with your image upload API endpoint
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        
        if (data.url) {
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection();
          quill.insertEmbed(range.index, 'image', data.url);
        }
      } catch (error) {
        message.error('Image upload failed');
      } finally {
        setLoading(false);
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
    imageResize: {
      parchment: ReactQuill.Quill.import('parchment'),
      modules: ['Resize', 'DisplaySize']
    }
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align',
    'link', 'image', 'video'
  ];

  return (
    <div style={{ height: '400px', marginBottom: '40px' }}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        style={{ height: '300px' }}
      />
    </div>
  );
};

export default RichTextEditor;