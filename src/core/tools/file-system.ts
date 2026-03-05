import fs from 'fs';
import path from 'path';

export class FileSystem {
  // 读取文件内容
  static async readFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, encoding, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  // 写入文件内容
  static async writeFile(filePath: string, content: string, encoding: BufferEncoding = 'utf8'): Promise<void> {
    return new Promise((resolve, reject) => {
      // 确保目录存在
      const dir = path.dirname(filePath);
      fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) {
          reject(err);
        } else {
          fs.writeFile(filePath, content, encoding, (err2) => {
            if (err2) {
              reject(err2);
            } else {
              resolve();
            }
          });
        }
      });
    });
  }

  // 追加文件内容
  static async appendFile(filePath: string, content: string, encoding: BufferEncoding = 'utf8'): Promise<void> {
    return new Promise((resolve, reject) => {
      const dir = path.dirname(filePath);
      fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) {
          reject(err);
        } else {
          fs.appendFile(filePath, content, encoding, (err2) => {
            if (err2) {
              reject(err2);
            } else {
              resolve();
            }
          });
        }
      });
    });
  }

  // 删除文件
  static async deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // 读取目录内容
  static async readDirectory(dirPath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(dirPath, (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });
  }

  // 创建目录
  static async createDirectory(dirPath: string, recursive: boolean = true): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.mkdir(dirPath, { recursive }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // 删除目录
  static async deleteDirectory(dirPath: string, recursive: boolean = true): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.rm(dirPath, { recursive }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // 检查文件或目录是否存在
  static async exists(filePath: string): Promise<boolean> {
    return new Promise((resolve) => {
      fs.access(filePath, (err) => {
        resolve(!err);
      });
    });
  }

  // 获取文件信息
  static async stat(filePath: string): Promise<fs.Stats> {
    return new Promise((resolve, reject) => {
      fs.stat(filePath, (err, stats) => {
        if (err) {
          reject(err);
        } else {
          resolve(stats);
        }
      });
    });
  }

  // 复制文件
  static async copyFile(sourcePath: string, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const destDir = path.dirname(destPath);
      fs.mkdir(destDir, { recursive: true }, (err) => {
        if (err) {
          reject(err);
        } else {
          fs.copyFile(sourcePath, destPath, (err2) => {
            if (err2) {
              reject(err2);
            } else {
              resolve();
            }
          });
        }
      });
    });
  }

  // 移动文件
  static async moveFile(sourcePath: string, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const destDir = path.dirname(destPath);
      fs.mkdir(destDir, { recursive: true }, (err) => {
        if (err) {
          reject(err);
        } else {
          fs.rename(sourcePath, destPath, (err2) => {
            if (err2) {
              reject(err2);
            } else {
              resolve();
            }
          });
        }
      });
    });
  }

  // 读取JSON文件
  static async readJSONFile(filePath: string): Promise<any> {
    const content = await this.readFile(filePath);
    return JSON.parse(content);
  }

  // 写入JSON文件
  static async writeJSONFile(filePath: string, data: any, space: number | string = 2): Promise<void> {
    const content = JSON.stringify(data, null, space);
    await this.writeFile(filePath, content);
  }
}

// 创建文件系统执行器实例
export const fileSystem = new FileSystem();