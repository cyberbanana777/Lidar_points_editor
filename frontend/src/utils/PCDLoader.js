import * as THREE from 'three';

class PCDLoader {
  constructor(manager) {
    this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;
  }

  load(url, onLoad, onProgress, onError) {
    const loader = new THREE.FileLoader(this.manager);
    loader.setResponseType('arraybuffer');
    loader.load(url, (data) => {
      try {
        onLoad(this.parse(data));
      } catch (e) {
        if (onError) {
          onError(e);
        } else {
          console.error(e);
        }
      }
    }, onProgress, onError);
  }

  parse(data) {
    // Parse header
    const textDecoder = new TextDecoder('utf-8');
    const headerText = textDecoder.decode(new Uint8Array(data, 0, 512));
    const header = this.parseHeader(headerText);
    
    // Parse data
    const vertices = [];
    const colors = [];
    
    if (header.data === 'ascii') {
      this.parseASCII(data, header, vertices, colors);
    } else if (header.data === 'binary_compressed') {
      throw new Error('Binary compressed format not supported');
    } else {
      this.parseBinary(data, header, vertices, colors);
    }
    
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    if (colors.length > 0) {
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }
    
    geometry.computeBoundingSphere();
    
    return geometry;
  }

  parseHeader(headerText) {
    const lines = headerText.split('\n');
    const header = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('#') || line === '') continue;
      
      const parts = line.split(' ', 2);
      if (parts.length < 2) continue;
      
      const key = parts[0].toLowerCase();
      const value = parts[1];
      
      if (key === 'version') header.version = value;
      else if (key === 'fields') header.fields = line.substring(7).split(' ');
      else if (key === 'size') header.size = line.substring(5).split(' ').map(Number);
      else if (key === 'type') header.type = line.substring(5).split(' ');
      else if (key === 'count') header.count = line.substring(6).split(' ').map(Number);
      else if (key === 'width') header.width = parseInt(value, 10);
      else if (key === 'height') header.height = parseInt(value, 10);
      else if (key === 'viewpoint') header.viewpoint = value;
      else if (key === 'points') header.points = parseInt(value, 10);
      else if (key === 'data') header.data = value;
      
      if (header.points && header.data) break;
    }
    
    return header;
  }

  parseASCII(data, header, vertices, colors) {
    const text = new TextDecoder('utf-8').decode(data);
    const lines = text.split('\n');
    
    // Skip header
    let lineIndex = 0;
    while (lineIndex < lines.length && 
           (lines[lineIndex].startsWith('#') || lines[lineIndex].trim() === '')) {
      lineIndex++;
    }
    
    const xIndex = header.fields.indexOf('x');
    const yIndex = header.fields.indexOf('y');
    const zIndex = header.fields.indexOf('z');
    const rgbIndex = header.fields.indexOf('rgb');
    
    for (let i = 0; i < header.points; i++) {
      if (lineIndex >= lines.length) break;
      
      const line = lines[lineIndex++].trim();
      if (line === '') continue;
      
      const values = line.split(/\s+/);
      
      if (xIndex !== -1 && yIndex !== -1 && zIndex !== -1) {
        const x = parseFloat(values[xIndex]);
        const y = parseFloat(values[yIndex]);
        const z = parseFloat(values[zIndex]);
        
        vertices.push(x, y, z);
      }
      
      if (rgbIndex !== -1) {
        const rgb = parseFloat(values[rgbIndex]);
        const r = ((rgb >> 16) & 0xff) / 255;
        const g = ((rgb >> 8) & 0xff) / 255;
        const b = (rgb & 0xff) / 255;
        
        colors.push(r, g, b);
      } else {
        // Default color if no RGB data
        colors.push(1, 1, 1);
      }
    }
  }

  parseBinary(data, header, vertices, colors) {
    const dataview = new DataView(data);
    let offset = 512; // Skip header
    
    const xIndex = header.fields.indexOf('x');
    const yIndex = header.fields.indexOf('y');
    const zIndex = header.fields.indexOf('z');
    const rgbIndex = header.fields.indexOf('rgb');
    
    const rowSize = header.size.reduce((sum, size) => sum + size, 0);
    
    for (let i = 0; i < header.points; i++) {
      let x, y, z, r, g, b;
      
      for (let j = 0; j < header.fields.length; j++) {
        const field = header.fields[j];
        const size = header.size[j];
        const type = header.type[j];
        
        if (field === 'x') {
          x = this.readData(dataview, offset, type, size);
        } else if (field === 'y') {
          y = this.readData(dataview, offset, type, size);
        } else if (field === 'z') {
          z = this.readData(dataview, offset, type, size);
        } else if (field === 'rgb') {
          const rgb = this.readData(dataview, offset, type, size);
          r = ((rgb >> 16) & 0xff) / 255;
          g = ((rgb >> 8) & 0xff) / 255;
          b = (rgb & 0xff) / 255;
        }
        
        offset += size;
      }
      
      if (x !== undefined && y !== undefined && z !== undefined) {
        vertices.push(x, y, z);
      }
      
      if (r !== undefined && g !== undefined && b !== undefined) {
        colors.push(r, g, b);
      } else {
        colors.push(1, 1, 1);
      }
    }
  }

  readData(dataview, offset, type, size) {
    switch (type) {
      case 'F':
      case 'f':
        if (size === 4) {
          return dataview.getFloat32(offset, true);
        } else {
          return dataview.getFloat64(offset, true);
        }
      case 'U':
        if (size === 1) {
          return dataview.getUint8(offset);
        } else if (size === 2) {
          return dataview.getUint16(offset, true);
        } else if (size === 4) {
          return dataview.getUint32(offset, true);
        }
        break;
      case 'I':
        if (size === 1) {
          return dataview.getInt8(offset);
        } else if (size === 2) {
          return dataview.getInt16(offset, true);
        } else if (size === 4) {
          return dataview.getInt32(offset, true);
        }
        break;
      default:
        throw new Error(`Unknown data type: ${type}`);
    }
  }
}

export default PCDLoader;