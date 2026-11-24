#include <stdio.h>
#include <stdlib.h>

typedef void *Handle;
extern Handle eglGetDisplay(Handle), eglCreatePbufferSurface(Handle,Handle,const int*), eglCreateContext(Handle,Handle,Handle,const int*);
extern int eglInitialize(Handle,int*,int*), eglBindAPI(unsigned), eglChooseConfig(Handle,const int*,Handle*,int,int*), eglMakeCurrent(Handle,Handle,Handle,Handle);
extern unsigned glCreateShader(unsigned), glCreateProgram(void), glGetAttribLocation(unsigned,const char*), glGetUniformLocation(unsigned,const char*);
extern void glShaderSource(unsigned,int,const char**,const int*),glCompileShader(unsigned),glGetShaderiv(unsigned,unsigned,int*), glGetShaderInfoLog(unsigned,int,int*,char*),glAttachShader(unsigned,unsigned),glLinkProgram(unsigned),glUseProgram(unsigned),glViewport(int,int,int,int),glVertexAttribPointer(unsigned,int,unsigned,unsigned char,int,const void*),glEnableVertexAttribArray(unsigned),glUniform2f(int,float,float),glUniform1f(int,float),glDrawArrays(unsigned,int,int),glReadPixels(int,int,int,int,unsigned,unsigned,void*);

unsigned shader(unsigned type,const char *source) {
  unsigned id=glCreateShader(type);
  glShaderSource(id,1,&source,NULL);
  glCompileShader(id);
  int ok;
  glGetShaderiv(id,0x8B81,&ok);
  if(!ok) { char log[4096]; glGetShaderInfoLog(id,sizeof(log),NULL,log); fprintf(stderr,"%s\n",log); exit(2); }
  return id;
}
int main(void) {
  Handle d=eglGetDisplay(NULL), cfg;
  int n;
  const int config[]={0x3033,1,0x3040,4,0x3024,8,0x3023,8,0x3022,8,0x3021,8,0x3038};
  const int w=224,h=266,frames=120;
  const int surface[]={0x3057,w,0x3056,h,0x3038}, context[]={0x3098,2,0x3038};
  if(!eglInitialize(d,NULL,NULL)||!eglBindAPI(0x30A0)||!eglChooseConfig(d,config,&cfg,1,&n)||n<1) return 3;
  Handle surf=eglCreatePbufferSurface(d,cfg,surface), ctx=eglCreateContext(d,cfg,NULL,context);
  if(!eglMakeCurrent(d,surf,surf,ctx)) return 4;

  FILE *src=fopen("scripts/pote-sorvete.glsl","r");
  char code[16384]={0};
  if(!src||!fread(code,1,sizeof(code)-1,src)) return 5;
  fclose(src);
  unsigned p=glCreateProgram();
  glAttachShader(p,shader(0x8B31,"attribute vec2 point; void main(){gl_Position=vec4(point,0.,1.);}"));
  glAttachShader(p,shader(0x8B30,code));
  glLinkProgram(p); glUseProgram(p); glViewport(0,0,w,h);
  const float verts[]={-1,-1,3,-1,-1,3};
  unsigned a=glGetAttribLocation(p,"point");
  glEnableVertexAttribArray(a);glVertexAttribPointer(a,2,0x1406,0,0,verts);
  glUniform2f(glGetUniformLocation(p,"tamanho"),w,h);
  int angle=glGetUniformLocation(p,"angulo");
  unsigned char pixels[w*h*4];
  FILE *out=fopen("frames.rgba","wb");
  if(!out) return 6;
  for(int i=0;i<frames;i++){
    glUniform1f(angle,6.283185307f*i/frames);
    glDrawArrays(4,0,3);
    glReadPixels(0,0,w,h,0x1908,0x1401,pixels);
    for(int j=h-1;j>=0;j--) fwrite(pixels+j*w*4,1,w*4,out);
  }
  fclose(out);
}
