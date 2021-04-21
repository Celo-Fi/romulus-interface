/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { mat4, vec3 } from "gl-matrix";
import { useEffect, useRef } from "react";
import REGL from "regl";

const initTheCube = (cubeCanvas: HTMLCanvasElement) => {
  const regl = REGL({
    canvas: cubeCanvas,
    attributes: {
      antialias: true,
      alpha: false,
    },
  });

  let tick: REGL.Cancellable | null = null;

  const play = (action: any) => {
    if (!tick) {
      tick = regl.frame(action);
    }
  };

  const stop = () => {
    if (tick) {
      tick.cancel();
      tick = null;
    }
  };

  const Texture = (regl: REGL.Regl, src: string) => {
    const texture = regl.texture();

    const image = new Image();

    image.src = src;

    image.onload = function () {
      texture({
        data: image,
        flipY: true,
        min: "mipmap",
      });
    };

    return texture;
  };

  const emptyTexture = regl.texture();

  const CONTENT_CONFIG = {
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    rotation: 0,
    rotateX: 1,
    rotateY: 1,
    rotateZ: 1,
    scale: 1,
  };

  const contentDraw = regl({
    frag: `
    precision mediump float;
    #define GLSLIFY 1
    
    uniform vec2 u_resolution;
    uniform sampler2D u_texture;
    uniform int u_maskId;
    uniform int u_typeId;
    uniform sampler2D u_displacement;
    uniform sampler2D u_mask;
    uniform float u_tick;
    
    varying vec2 v_uv;
    
    const float PI2 = 6.283185307179586;
    
    const float PI = 3.141592653589793;
    const float PI2_0 = 6.28318530718;
    
    mat2 scale(vec2 value) {
      return mat2(value.x, 0.0, 0.0, value.y);
    }
    
    mat2 rotate2d(float value){
      return mat2(cos(value), -sin(value), sin(value), cos(value));
    }
    
    vec3 gradient1(vec2 st, float tick) {
      vec3 c1 = vec3(253.0/255.0, 142.0/255.0,  98.0/255.0);
      vec3 c2 = vec3(251.0/255.0,  83.0/255.0, 184.0/255.0);
      vec3 c3 = c2;
      vec3 c4 = vec3( 57.0/255.0,  15.0/255.0, 248.0/255.0);
    
      st.y = 1.0 - st.y;
    
      vec2 toCenter = vec2(0.55, 0.58) - st;
      float angle = atan(toCenter.y, toCenter.x) / PI;
    
      vec3 colorA = mix(c1, c2, smoothstep(0.0, 0.5, angle));
    
      st -= vec2(0.5);
      st *= scale(vec2(1.4));
      st *= rotate2d(-1.44);
      st += vec2(0.5);
    
      vec3 colorB = mix(c2, c3, smoothstep(0.3, 0.8, st.x));
      colorB = mix(colorB, c4, smoothstep(0.55, 1.0, st.x));
    
      return mix(colorA, colorB, smoothstep(0.28, 0.65, st.x));
    }
    
    vec3 gradient2(vec2 st, float tick) {
      vec3 c1 = vec3(1.0, 0.8, 0.2);
      vec3 c2 = vec3(0.92, 0.20, 0.14);
    
      st -= vec2(0.5);
      st *= scale(vec2(3.8));
      st *= rotate2d(tick * PI);
      st += vec2(0.5);
    
      return mix(c1, c2, st.x);
    }
    
    vec3 gradient3(vec2 st, float tick) {
      vec3 c1 = vec3(229.0/255.0, 255.0/255.0, 196.0/255.0);
      vec3 c2 = vec3(200.0/255.0, 255.0/255.0, 224.0/255.0);
      vec3 c3 = vec3(180.0/255.0, 255.0/255.0, 245.0/255.0);
      vec3 c4 = vec3(203.0/255.0, 223.0/255.0, 255.0/255.0);
      vec3 c5 = vec3(233.0/255.0, 201.0/255.0, 255.0/255.0);
    
      st -= vec2(0.5);
      st *= scale(vec2(1.2));
      st *= rotate2d(tick * (PI / 2.5));
      st += vec2(0.5);
    
      vec3 colorB = mix(c1, c2, smoothstep(0.0, 0.25, st.x));
      colorB = mix(colorB, c3, smoothstep(0.25, 0.5, st.x));
      colorB = mix(colorB, c4, smoothstep(0.5, 0.75, st.x));
      colorB = mix(colorB, c5, smoothstep(0.75, 1.0, st.x));
    
      return colorB;
    }
    
    vec3 gradients(int type, vec2 st, float tick) {
      if (type == 1) {
        return gradient1(st, tick);
      } else if (type == 2) {
        return gradient2(st, tick);
      } else if (type == 3) {
        return gradient3(st, tick);
      }
    }
    
    void main() {
      vec2 st = gl_FragCoord.xy / u_resolution;
    
      vec4 displacement = texture2D(u_displacement, st);
      
      vec2 direction = vec2(cos(displacement.r * PI2), sin(displacement.r * PI2));
      float length = displacement.g;
    
      vec2 newUv = v_uv;
    
      newUv.x += (length * 0.07) * direction.x;
      newUv.y += (length * 0.07) * direction.y;
    
      vec4 texture = texture2D(u_texture, newUv);
      float tick = u_tick * 0.009;
    
      vec3 color = gradients(u_typeId, v_uv, tick);
    
      texture.rgb = color + (texture.rgb * color);
    
      vec4 mask = texture2D(u_mask, st);
    
      int maskId = int(mask.r * 4.0 + mask.g * 2.0 + mask.b * 1.0);
    
      if (maskId == u_maskId) {
        gl_FragColor = vec4(texture.rgb, texture.a * mask.a);
      } else {
        discard;
      }
    }
  `,
    vert: `
    precision mediump float;
    #define GLSLIFY 1

    attribute vec3 a_position;
    attribute vec2 a_uv;

    uniform mat4 u_projection;
    uniform mat4 u_view;
    uniform mat4 u_world;

    varying vec2 v_uv;

    void main() {
      v_uv = a_uv;

      gl_Position = u_projection * u_view * u_world * vec4(a_position, 1);
    }
  `,
    attributes: {
      a_position: [
        [-1, -1, 0],
        [1, -1, 0],
        [1, 1, 0],
        [-1, 1, 0],
      ],
      a_uv: [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ],
    },
    uniforms: {
      // @ts-ignore
      u_texture: regl.prop("texture"),
      // @ts-ignore
      u_typeId: regl.prop("typeId"),
      // @ts-ignore
      u_maskId: regl.prop("maskId"),
    },
    depth: {
      enable: true,
      mask: false,
      func: "less",
    },
    blend: {
      enable: true,
      func: {
        srcRGB: "src alpha",
        srcAlpha: 1,
        dstRGB: "one minus src alpha",
        dstAlpha: 1,
      },
      equation: {
        rgb: "add",
        alpha: "add",
      },
      color: [0, 0, 0, 0],
    },
    elements: [0, 1, 2, 0, 2, 3],
    count: 6,
  });

  const contentSetup = regl({
    context: {
      world: () => {
        const {
          translateX,
          translateY,
          translateZ,
          rotation,
          rotateX,
          rotateY,
          rotateZ,
          scale,
        } = CONTENT_CONFIG;

        const world = mat4.create();

        mat4.translate(world, world, [translateX, translateY, translateZ]);
        mat4.rotate(world, world, rotation, [rotateX, rotateY, rotateZ]);
        mat4.scale(world, world, [scale, scale, scale]);

        return world;
      },
      // @ts-ignore
      mask: (context, { mask }) => {
        return mask || emptyTexture;
      },
      // @ts-ignore
      displacement: (context, { displacement }) => {
        return displacement || emptyTexture;
      },
    },
    uniforms: {
      // @ts-ignore
      u_world: regl.context("world"),
      // @ts-ignore
      u_mask: regl.context("mask"),
      // @ts-ignore
      u_displacement: regl.context("displacement"),
      u_tick: regl.context("tick"),
    },
  });

  // @ts-ignore
  const content = (props) => {
    // @ts-ignore
    contentSetup(props, (context, { textures }) => {
      regl.clear({
        color: [0, 0, 0, 0],
        depth: 1,
      });

      contentDraw(textures);
    });
  };

  const ContentTypes = {
    GRADIENT: 1,
    RED: 2,
    BLUE: 3,
  };

  const emptyCube = regl.cube();

  const CUBE_CONFIG = {
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    rotation: 0,
    rotateX: 1,
    rotateY: 1,
    rotateZ: 1,
    scale: 1,
    borderWidth: 0.008,
    displacementLength: 0.028,
    reflectionOpacity: 0.3,
    scene: 3,
  };

  const cube = regl({
    frag: `
    precision mediump float;
    #define GLSLIFY 1
    
    uniform vec2 u_resolution;
    uniform int u_face;
    uniform int u_typeId;
    uniform sampler2D u_texture;
    uniform samplerCube u_reflection;
    uniform float u_tick;
    uniform float u_borderWidth;
    uniform float u_displacementLength;
    uniform float u_reflectionOpacity;
    uniform int u_scene;
    
    varying vec3 v_normal;
    varying vec3 v_center;
    varying vec3 v_point;
    varying vec2 v_uv;
    varying vec3 v_color;
    varying float v_depth;
    
    const float PI2 = 6.283185307179586;
    
    float borders(vec2 uv, float strokeWidth) {
      vec2 borderBottomLeft = smoothstep(vec2(0.0), vec2(strokeWidth), uv);

      vec2 borderTopRight = smoothstep(vec2(0.0), vec2(strokeWidth), 1.0 - uv);
    
      return 1.0 - borderBottomLeft.x * borderBottomLeft.y * borderTopRight.x * borderTopRight.y;
    }
    
    const float PI2_0 = 6.28318530718;
    
    vec4 radialRainbow(vec2 st, float tick) {
      vec2 toCenter = vec2(0.5) - st;
      float angle = mod((atan(toCenter.y, toCenter.x) / PI2_0) + 0.5 + sin(tick * 0.002), 1.0);
    
      // colors
      vec4 c1 = vec4(229.0/255.0, 255.0/255.0, 196.0/255.0, 1.0);
      vec4 c2 = vec4(200.0/255.0, 255.0/255.0, 224.0/255.0, 1.0);
      vec4 c3 = vec4(180.0/255.0, 255.0/255.0, 245.0/255.0, 1.0);
      vec4 c4 = vec4(203.0/255.0, 223.0/255.0, 255.0/255.0, 1.0);
      vec4 c5 = vec4(233.0/255.0, 201.0/255.0, 255.0/255.0, 1.0);
      // vec4 a = vec4(0.43, 0.48, 0.95, 1.0);
      // vec4 b = vec4(0.94, 0.79, 0.41, 1.0);
      // // vec4 b = vec4(0.49, 0.88, 1.00, 1.0);
      // vec4 c = vec4(0.68, 0.29, 0.68, 1.0);
      // vec4 d = vec4(0.94, 0.79, 0.41, 1.0);
      // vec4 e = vec4(0.43, 0.48, 0.95, 1.0);
    
      float step = 1.0 / 10.0;
    
      vec4 color = c1;
    
      color = mix(color, c2, smoothstep(step * 1.0, step * 2.0, angle));
      color = mix(color, c1, smoothstep(step * 2.0, step * 3.0, angle));
      color = mix(color, c2, smoothstep(step * 3.0, step * 4.0, angle));
      color = mix(color, c3, smoothstep(step * 4.0, step * 5.0, angle));
      color = mix(color, c4, smoothstep(step * 5.0, step * 6.0, angle));
      color = mix(color, c3, smoothstep(step * 6.0, step * 7.0, angle));
      color = mix(color, c4, smoothstep(step * 7.0, step * 8.0, angle));
      color = mix(color, c5, smoothstep(step * 8.0, step * 9.0, angle));
      color = mix(color, c1, smoothstep(step * 9.0, step * 10.0, angle));
    
      return color;
    }
    
    mat2 scale(vec2 value){
      return mat2(value.x, 0.0, 0.0, value.y);
    }
    
    mat2 rotate2d(float value){
      return mat2(cos(value), -sin(value), sin(value), cos(value));
    }
    
    vec2 rotateUV(vec2 uv, float rotation) {
      float mid = 0.5;
      return vec2(
        cos(rotation) * (uv.x - mid) + sin(rotation) * (uv.y - mid) + mid,
        cos(rotation) * (uv.y - mid) - sin(rotation) * (uv.x - mid) + mid
      );
    }
    
    vec4 type1() {
      vec2 toCenter = v_center.xy - v_point.xy;
      float angle = (atan(toCenter.y, toCenter.x) / PI2) + 0.5;
      float displacement = borders(v_uv, u_displacementLength) + borders(v_uv, u_displacementLength * 2.143) * 0.3;
    
      return vec4(angle, displacement, 0.0, 1.0);
    }
    
    vec4 type2() {
      return vec4(v_color, 1.0);
    }
    
    vec4 type3() {
      vec2 st = gl_FragCoord.xy / u_resolution;
    
      vec4 strokeColor = radialRainbow(st, u_tick);
      float depth = clamp(smoothstep(-1.0, 1.0, v_depth), 0.6, 0.9);
      vec4 stroke = strokeColor * vec4(borders(v_uv, u_borderWidth)) * depth;
    
      vec4 texture;
    
      if (u_face == -1) {
        vec3 normal = normalize(v_normal);
        texture = textureCube(u_reflection, normalize(v_normal));
    
        texture.a *= u_reflectionOpacity * depth;
      }  else {
        texture = texture2D(u_texture, st);
      }
    
      if (stroke.a > 0.0) {
        return stroke - texture.a;
      } else {
        return texture;
      }
    }
    
    vec4 switchScene(int id) {
      if (id == 1) {
        return type1();
      } else if (id == 2) {
        return type2();
      } else if (id == 3) {
        return type3();
      }
    }
    
    void main() {
      if (u_scene == 3) {
        gl_FragColor = switchScene(u_typeId);
      } else {
        gl_FragColor = switchScene(u_scene);
      }
    }
  `,
    vert: `
    precision mediump float;
    #define GLSLIFY 1
    
    attribute vec3 a_position;
    attribute vec3 a_center;
    attribute vec2 a_uv;
    attribute vec3 a_color;
    
    uniform mat4 u_projection;
    uniform mat4 u_view;
    uniform mat4 u_world;
    
    varying vec3 v_normal;
    varying vec3 v_center;
    varying vec3 v_point;
    varying vec2 v_uv;
    varying vec3 v_color;
    varying float v_depth;
    
    void main() {
      vec4 center = u_projection * u_view * u_world * vec4(a_center, 1.0);
      vec4 position = u_projection * u_view * u_world * vec4(a_position, 1.0);
    
      v_normal = normalize(a_position);
      v_center = center.xyz;
      v_point = position.xyz;
      v_uv = a_uv;
      v_color = a_color;
      v_depth = (mat3(u_view) * mat3(u_world) * a_position).z;
    
      gl_Position = position;
    }
  `,
    context: {
      // @ts-ignore
      world: (context, { matrix }) => {
        const {
          translateX,
          translateY,
          translateZ,
          rotation,
          rotateX,
          rotateY,
          rotateZ,
          scale,
        } = CUBE_CONFIG;

        const world = mat4.create();

        mat4.translate(world, world, [translateX, translateY, translateZ]);
        mat4.rotate(world, world, rotation, [rotateX, rotateY, rotateZ]);
        mat4.scale(world, world, [scale, scale, scale]);

        if (matrix) {
          mat4.multiply(world, world, matrix);
        }

        return world;
      },
      // @ts-ignore
      face: (_, { cullFace }: any) => {
        return cullFace === CubeFaces.FRONT ? -1 : 1;
      },
      // @ts-ignore
      texture: (_, { texture }: any) => {
        return texture || emptyTexture;
      },
      // @ts-ignore
      reflection: (_, { reflection }: any): any => {
        return reflection || emptyCube;
      },
      // @ts-ignore
      textureMatrix: (_, { textureMatrix }: any): any => {
        return textureMatrix;
      },
      borderWidth: () => {
        const { borderWidth } = CUBE_CONFIG;

        return borderWidth;
      },
      displacementLength: () => {
        const { displacementLength } = CUBE_CONFIG;

        return displacementLength;
      },
      reflectionOpacity: () => {
        const { reflectionOpacity } = CUBE_CONFIG;

        return reflectionOpacity;
      },
      scene: () => {
        const { scene } = CUBE_CONFIG;

        // @ts-ignore
        return parseFloat(scene);
      },
    },
    attributes: {
      a_position: [
        [-1, +1, +1],
        [+1, +1, +1],
        [+1, -1, +1],
        [-1, -1, +1], // front face
        [+1, +1, +1],
        [+1, +1, -1],
        [+1, -1, -1],
        [+1, -1, +1], // right face
        [+1, +1, -1],
        [-1, +1, -1],
        [-1, -1, -1],
        [+1, -1, -1], // back face
        [-1, +1, -1],
        [-1, +1, +1],
        [-1, -1, +1],
        [-1, -1, -1], // left face
        [-1, +1, -1],
        [+1, +1, -1],
        [+1, +1, +1],
        [-1, +1, +1], // top face
        [-1, -1, -1],
        [+1, -1, -1],
        [+1, -1, +1],
        [-1, -1, +1], // bottom face
      ],
      a_center: [
        [0, 0, 1], // front face
        [1, 0, 0], // right face
        [0, 0, -1], // back face
        [-1, 0, 0], // left face
        [0, 1, 0], // top face
        [0, -1, 0], // bottom face
      ].map((c) => {
        return [c, c, c, c];
      }),
      a_uv: [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1], // front face
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1], // right face
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1], // back face
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1], // left face
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1], // top face
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1], // bottom face
      ],
      a_color: [
        [0, 1, 0], // front face => mask 2
        [0, 0, 1], // right face => mask 1
        [1, 0, 0], // back face => mask 4
        [1, 1, 0], // left face => mask 6
        [1, 0, 1], // top face => mask 5
        [0, 1, 1], // bottom face => mask 3
      ].map((c) => {
        return [c, c, c, c];
      }),
    },
    uniforms: {
      // @ts-ignore
      u_world: regl.context("world"),
      // @ts-ignore
      u_face: regl.context("face"),
      // @ts-ignore
      u_typeId: regl.prop("typeId"),
      // @ts-ignore
      u_texture: regl.context("texture"),
      // @ts-ignore
      u_reflection: regl.context("reflection"),
      // @ts-ignore
      u_tick: regl.context("tick"),
      // @ts-ignore
      u_borderWidth: regl.context("borderWidth"),
      // @ts-ignore
      u_displacementLength: regl.context("displacementLength"),
      // @ts-ignore
      u_reflectionOpacity: regl.context("reflectionOpacity"),
      // @ts-ignore
      u_scene: regl.context("scene"),
    },
    cull: {
      enable: true,
      // @ts-ignore
      face: regl.prop("cullFace"),
    },
    depth: {
      enable: true,
      mask: false,
      func: "less",
    },
    blend: {
      enable: true,
      func: {
        srcRGB: "src alpha",
        srcAlpha: 1,
        dstRGB: "one minus src alpha",
        dstAlpha: 1,
      },
      equation: {
        rgb: "add",
        alpha: "add",
      },
      color: [0, 0, 0, 0],
    },
    elements: [
      [2, 1, 0],
      [2, 0, 3], // front face
      [6, 5, 4],
      [6, 4, 7], // right face
      [10, 9, 8],
      [10, 8, 11], // back face
      [14, 13, 12],
      [14, 12, 15], // left face
      [18, 17, 16],
      [18, 16, 19], // top face
      [20, 21, 22],
      [23, 20, 22], // bottom face
    ],
    count: 36,
    // @ts-ignore
    framebuffer: regl.prop("fbo"),
  });

  const CubeTypes = {
    DISPLACEMENT: 1,
    MASK: 2,
    FINAL: 3,
  };

  const CubeFaces = {
    BACK: "back",
    FRONT: "front",
  };

  const CubeMasks = {
    M1: 1,
    M2: 2,
    M3: 3,
    M4: 4,
    M5: 5,
    M6: 6,
  };

  const CAMERA_CONFIG = {
    fov: 35,
    near: 0.01,
    far: 1000,
  };

  const cameraConfig = {
    eye: [0, 0, 6],
    target: [0, 0, 0],
    up: [0, 1, 0],
  };

  const camera = regl({
    context: {
      projection: ({ viewportWidth, viewportHeight }) => {
        const { fov, near, far } = CAMERA_CONFIG;
        const fovy = (fov * Math.PI) / 180;
        const aspect = viewportWidth / viewportHeight;

        // @ts-ignore
        return mat4.perspective([], fovy, aspect, near, far);
      },

      view: (context, props) => {
        const config = Object.assign({}, cameraConfig, props);

        const { eye, target, up } = config;

        // @ts-ignore
        return mat4.lookAt([], eye, target, up);
      },

      fov: () => {
        const { fov } = CAMERA_CONFIG;

        return fov;
      },
    },

    uniforms: {
      // @ts-ignore
      u_projection: regl.context("projection"),
      // @ts-ignore
      u_view: regl.context("view"),
      // @ts-ignore
      u_cameraPosition: regl.context("eye"),
      u_resolution: ({ viewportWidth, viewportHeight }) => {
        return [viewportWidth, viewportHeight];
      },
    },
  });

  const reflector = regl({
    frag: `
    precision mediump float;
    #define GLSLIFY 1
    
    uniform vec2 u_resolution;
    uniform sampler2D u_texture;
    uniform float u_depthOpacity;
    
    varying vec2 v_uv;
    varying float v_z;
    
    mat2 scale(vec2 scale){
      return mat2(scale.x, 0.0, 0.0, scale.y);
    }
    
    void main() {
      vec2 st = gl_FragCoord.xy / u_resolution;
    
      vec4 texture = texture2D(u_texture, v_uv);

      texture.a -= u_depthOpacity * v_z;
    
      gl_FragColor = texture;
    }
  `,
    vert: `
    precision mediump float;
    #define GLSLIFY 1
    
    attribute vec3 a_position;
    attribute vec2 a_uv;
    
    uniform mat4 u_projection;
    uniform mat4 u_view;
    uniform mat4 u_world;
    uniform vec2 u_viewport;
    
    varying vec2 v_uv;
    varying float v_z;
    
    void main() {
      v_uv = a_uv;
      v_z = 1.0 - (mat3(u_view) * mat3(u_world) * a_position).z;
    
      gl_Position = u_projection * u_view * u_world * vec4(a_position, 1);
    }
  `,
    context: {
      world: (
        { viewportWidth, viewportHeight },
        // @ts-ignore
        { cameraConfig: mainCameraConfig, fov }
      ) => {
        const fovy = (fov * Math.PI) / 180;
        const aspect = viewportWidth / viewportHeight;
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const cameraHeight = Math.tan(fovy / 2) * mainCameraConfig.eye[2];
        const cameraWidth = cameraHeight * aspect;

        const world = mat4.create();

        mat4.scale(world, world, [cameraWidth, cameraHeight, 1.0]);

        return world;
      },
      depthOpacity: () => {
        const depthOpacity = 0.75;

        return depthOpacity;
      },
    },
    attributes: {
      a_position: [
        [-1, -1, 0],
        [1, -1, 0],
        [1, 1, 0],
        [-1, 1, 0],
      ],
      a_uv: [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ],
    },
    uniforms: {
      // @ts-ignore
      u_world: regl.context("world"),
      // @ts-ignore
      u_texture: regl.prop("texture"),
      // @ts-ignore
      u_depthOpacity: regl.context("depthOpacity"),
    },
    depth: {
      enable: true,
      mask: false,
      func: "less",
    },
    blend: {
      enable: true,
      func: {
        srcRGB: "src alpha",
        srcAlpha: 1,
        dstRGB: "one minus src alpha",
        dstAlpha: 1,
      },
      equation: {
        rgb: "add",
        alpha: "add",
      },
      color: [0, 0, 0, 0],
    },
    elements: [0, 1, 2, 0, 2, 3],
    count: 6,
  });

  const planes = [
    {
      position: [1, 0, 0],
      normal: [1, 0, 0],
      rotation: -Math.PI * 0.5,
      axis: [0, 1, 0],
      uvRotation: Math.PI,
    },
    {
      position: [-1, 0, 0],
      normal: [-1, 0, 0],
      rotation: Math.PI * 0.5,
      axis: [0, 1, 0],
      uvRotation: Math.PI,
    },
    {
      position: [0, 1, 0],
      normal: [0, 1, 0],
      rotation: Math.PI * 0.5,
      axis: [1, 0, 0],
      uvRotation: 0,
    },
    {
      position: [0, -1, 0],
      normal: [0, -1, 0],
      rotation: -Math.PI * 0.5,
      axis: [1, 0, 0],
      uvRotation: 0,
    },
    {
      position: [0, 0, 1],
      normal: [0, 0, 1],
      rotation: Math.PI,
      axis: [0, 1, 0],
      uvRotation: Math.PI,
    },
    {
      position: [0, 0, -1],
      normal: [0, 0, -1],
      rotation: 0,
      axis: [0, 1, 0],
      uvRotation: Math.PI,
    },
  ];

  const renderTarget = regl.framebuffer();

  // @ts-ignore
  const reflect = (a, b) => {
    const dot2 = new Array(3);

    dot2.fill(2 * vec3.dot(b, a));

    // @ts-ignore
    return vec3.sub([], a, vec3.mul([], dot2, b));
  };

  const reflectionSetup = regl({
    context: {
      config: (
        context,
        // @ts-ignore
        { cameraConfig: mainCameraConfig, rotationMatrix },
        batchId
      ) => {
        const { position, normal, rotation, axis } = planes[batchId]!;

        // @ts-ignore
        const planeMatrix = mat4.translate([], rotationMatrix, position);
        // @ts-ignore
        const normalMatrix = mat4.translate([], rotationMatrix, normal);

        mat4.rotate(planeMatrix, planeMatrix, rotation, axis);

        // @ts-ignore
        const planeWorldPosition = mat4.getTranslation([], planeMatrix);
        // @ts-ignore
        const planeWorldNormal = mat4.getTranslation([], normalMatrix);
        // eslint-disable-next-line
        const cameraWorldPosition = mainCameraConfig.eye;

        let eye = vec3.fromValues(0, 0, 0);
        vec3.sub(eye, planeWorldPosition, cameraWorldPosition);
        eye = reflect(eye, planeWorldNormal);
        vec3.negate(eye, eye);
        vec3.add(eye, eye, planeWorldPosition);

        const lookAtPosition = vec3.fromValues(0, 0, -1);
        vec3.add(lookAtPosition, lookAtPosition, cameraWorldPosition);

        let target = vec3.fromValues(0, 0, 0);
        vec3.sub(target, planeWorldPosition, lookAtPosition);
        target = reflect(target, planeWorldNormal);
        vec3.negate(target, target);
        vec3.add(target, target, planeWorldPosition);

        let up = vec3.fromValues(0, 1, 0);
        up = reflect(up, planeWorldNormal);

        const cameraConfig = {
          eye,
          target,
          up,
        };

        return {
          cameraConfig,
          planeMatrix,
        };
      },
      uvRotation: (context, props, batchId) => {
        const { uvRotation } = planes[batchId]!;

        return uvRotation;
      },
      faceFbo: (context, { reflectionFbo }: any, batchId) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return reflectionFbo.faces[batchId];
      },
    },
  });

  const reflection = ({
    reflectionFbo,
    cameraConfig,
    rotationMatrix,
    texture,
  }: any) => {
    const props = new Array(6);

    props.fill({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      reflectionFbo,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      cameraConfig,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      rotationMatrix,
    } as any);

    reflectionSetup(
      props,
      ({ viewportWidth, viewportHeight, config, uvRotation, faceFbo }) => {
        const textureMatrix = mat4.fromValues(
          0.5,
          0,
          0,
          0,
          0,
          0.5,
          0,
          0,
          0,
          0,
          0.5,
          0,
          0.5,
          0.5,
          0.5,
          1
        );

        renderTarget.resize(viewportWidth, viewportHeight);

        renderTarget.use(() => {
          regl.clear({
            color: [0, 0, 0, 0],
            depth: 1,
          });

          camera(config.cameraConfig, ({ projection, view, fov }) => {
            // @ts-ignore
            mat4.multiply(textureMatrix, textureMatrix, projection);
            // @ts-ignore
            mat4.mul(textureMatrix, textureMatrix, view);
            mat4.mul(textureMatrix, textureMatrix, config.planeMatrix);

            reflector({
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              texture,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              cameraConfig,
              fov,
            });
          });
        });

        // eslint-disable-next-line
        faceFbo.use(() => {
          regl.clear({
            color: [0, 0, 0, 0],
            depth: 1,
          });
        });
      }
    );
  };

  const CONFIG = {
    cameraX: 0,
    cameraY: 0,
    cameraZ: 5.7,
    rotation: 4.8,
    rotateX: 1,
    rotateY: 1,
    rotateZ: 1,
    velocity: 0.005,
  };

  /**
   * Fbos
   */
  const displacementFbo = regl.framebuffer();
  const maskFbo = regl.framebuffer();
  const contentFbo = regl.framebuffer();
  const reflectionFbo = regl.framebufferCube(1024);

  /**
   * Textures
   */
  const availableTextures = {
    ["slide1"]: Texture(
      regl,
      "data:image/png;base64,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"
    ),
    ["slide2"]: Texture(
      regl,
      "data:image/png;base64,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"
    ),
    ["slide3"]: Texture(
      regl,
      "data:image/png;base64,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"
    ),
    ["slide4"]: Texture(
      regl,
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAB3sSURBVHgB7d3NkhtF1jDgxNgTs8OzmmA1xRVM8+MIdjS7b4e9fFe0rwB8BTRXYHv37Whfge0rQLMjwtiYK7DYTLB7zY5vaOA7x50Cuad/pKqSVCo9T4Si2/1nlVSVeSrzZJ5SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALvdGYaP29vau//Wvf70+/7Vff/31+u+///7H165evTqd//7PP//88vnz5y8LALQkAOjZrEP/5Zdf9mon3rzxxhv58a38PL7W5M/Vr10vHcXfm8aHl/H3MiB49Yiv/RAfp1euXJnm1+O5TAUMAMwTALSQnfy1a9eauFPfiw52L770VnS6+XlTeujUVyQDgwwIpvF5Bggv4vPvc3Thm2++mRYAdooA4BLZ2ced9M3a0f8zv1SG28m3laMDz+Mxjcckjvf7J0+ePC8AjJYA4AzZ6b/55pufxqc347FfdtM0Ho9jlONeTB9MS8/mXuP98mdA9f2q/j8AXicAmFPv9j+Lu/3Py/ju8rt4FK/J/W+//XZSOlrkNY6pisNnz559WQBYGQFA0fEv4Sju0L9se4f+3nvvHcRrfLcs9hofPX369HYBYCV2PgCIzn8vhqIfxqdNYSHL3qF/8MEH+/HhbiZKluUcRBDwoADQu50OAN5///3P4sO9QhuTGA24fdFoQMRWTQRXX5X2eRSTCAA+LgD0bmcDgBiOvluH/GlvGkHAx6eDgDql8kUfr2/8/XckBQL070rZQdH5f6Xz70Xe4X+dd/qzL+Q8f3ztRV+v79WrV5sCQO92bgSgdv4HhT7lBkO3Y47/i9LzsskYAXg3RgDsSQDQs50aAYjO/wudf//iNX2QWw7Ptjnu0UudP8BqXC07oi5BOyz0Jjr857/99tvtWSf9wQcf5CjA16U/jwoAK/Fm2QE5R33lypXMRrfGvycRTH359OnT//kxzL7273//e/r222/Ht97YLx1l3YIMLuLPK2IEsAI7MQXw5ptvHhbr/HuRHXPOy3/77beHZ33/2bNnhzkyUDqI338Znf8t2f8AqzP6ACCH/uPDp4U+3I+O+dKkvBhtuVPaO1rk/wCgm9GvAnj//fdfFHf/neQdeXTqt5apBRCve+YC7JfF5cZCd3T8AOsx6iTAevffFLqY5Fx8DO1Pl/mlzBGIwGF/gR+d5M/2UWgIgMWNegSgxV0oc2rHfFhauuj1z1yC+Pt3nj59OvpM/w8//LD5z3/+sx+fNnHM/8iP5yyZfJnLKfNjfP/7+Px5jLxMnzx5YlQE6N1oA4C6D/2LwtLaDPmfJUZgPq/V/07/7fvHx8f3YrR/lBn+uRVynHuZd3Iz/1m6rz7J12kSj0cxTfKvVSRH1u2bW+3eGCNERxI26SJuFm62KBaWNykvFAxrb7RTANGY3Swsra7tv7XskP9ZsmOIjnA+AGg1nbANTnX6+6Vf1+vfvRn/RzaWk3JSLrnPhu96NKZflBauXr06iQ/TAi1Fu3Az2uw2ydqTeAgAWhptABCN2SeFZT2IC/Hzvu7M8+9kZ5XD3XFx3x7jPH+9c/6s1j5Y1z4T+/mI1/YwPh66AwLaGHMS4H5hYV3n+88TnX8GFY/irn9Uw/0b6vhPa+JxJBAA2hhlAPDBBx/sR8dTuFzOyWchn+j8e03GqzkYufviTzEScFRGpJ5feWxNGYam1EDgrPLMAGcZ5UZAcce5dDLJLqrb7X7cdyZ+dESfRef/XTkZhflnGYm863/vvffu1noHTRmeV4mvWfSqAFxirFMATeFCs86/z7vFubv+/bkvN9lxbnvGfz22oXb8r8miVxGENXVjJbUUgDONcgQgGsDR3HWuyKRutzstPTl1139aU7ZYDvnXY2vK9jjI55yBSwE4wyhHAOLuNpc0Fc70IIb8D0pPajJcLvU7OO9n4vs5JbOVm9lEYPNpnE9HZTu9GrWI90heAPBfxjoCIAfgbPd77vz38i4zXu+DS360KVsoO//4cFS22ywIaArAnNEFANkpFf5LLvOLzr/VTm9nqUP+C82J1+1vt0o9j47KOMyCgE0tVwQGaHRTAFevXr1uCeDr+lzjX4f8M8t84WCizRafm1QT/h6WcZkd08cFoIxwBMASwNf13Pk3EWB9XTe/WeY5bM2dZ93Sdyuy/VvYz/oMBaCMMwegKbzSc+ef8/1ft7ybb7Zl+LmObjRlpLI4U65qKMDOG90UwDbON69Cn51/TYa7V7pteZu/O+g16XWHv5XcIdcdF3PDpVwN8cO1a9ee//zzzy/n1+ln2eDj4+MsFZzLWPO57K9i9CT+bgY5kwLstDEuA9z5RKc+O/+6q9xh6SimDpoy8IpxdXvfvj2K9yNXX0wu+8FvvvlmWk5eo/zZ+/m1eP0P4vczANsvHc1KMa+i5gOwfcYYADRlfSbxeBQN60/RSL9VThrpjZYh7rnz/2qBJX4L+e2335oyYLmqofR77jyqO/FNSwfPnj07Kif7/Ge99LvxfjSlnfvxHhyOrSgT0J4AoJ1JNO63z2jc79cM8twYZ+2BQF+df02Ey4zx/dKfpgxUXSPfy9B/brG8itLHtV7Do5imOKxD+Iua1PNiUgDmjCoAWNNmJxfupFeDgltxx3YUHz8t6/Ogp84/M/0frmDp3mCnZqLD3i89BCiz+gpxlz0tK5LvcYzMZD7B3XLJc1lFINJGDSgzp2Gv5uhcL3+eDzki8UM8XsTz/deTJ08GuWPkjRs39iLoz2uimcszauZ+ZBrH90N873kcx3Sox3Favjdxve/VvJN34pEjmc2pH5u9R9/FsX2/LcfG5UYVAOQ88yr3AKgN/EJ3ihkkRBCQn64jCJj0scPfrOBNHGdTelanSAYpnlvn6nnxmj2vxZVWPsQeAca9GgR8dcbzeDXPH53VvU0O99f9Ij6L57hf6kjSZdtzx+uXUzHTcjLC9uUmty+uQUteuzmStxfP7dLtxWffr8eRr/0kHo/i2nxQBuTUsS1VOn3ox7aMDOpy2/jSwbaPrI21GuBKZJW1ZRr4dQQBNSi5VTpaQ7W7pgxQJtmVjs9t9h6ss/Je5gbEdEBzajrgKJ7HnYF0/Bkot2lcm3JSyCivnaN1BwJ1JUjmg+yX7qtesoO9GcdxWAYQ1NRjy/Nlv3QzuGNbVl73ca10SvqNc/xO2fLVNKPaB2DViWZxkv+rLKnema8kSp4r6dupwV9TqdumDFBcxJ+Ujvouq7yoOuUzKSfz/B/HuXZ7k+V/Z1UTM1Au/Uz5ZCDwoq5EWam8BqIzy9GvvA6yc+tzyqopc8ey7j0xcg+PuWPbL/1qyuvH1pSBy+fYw6jfUVx/98qWG9tGQCu9sNo28hkE5BBx6VEO9fbR8WxTnfu+1Ya4U7JmJtht8s4ngtJbcX59vOmhyFo1cSXnUQYUEVzcLSuSHVd2YKX/zvG/5LFkkJTDz2XF8vyOY7t7QZnuXtVj+7ruGzJY8Rzzzr8pLeWNV454lBEQAKxJdtZ9BgFxsd3ess5/cO9NDFV36vyzITg+Pt7oXcAm7/jn5CjKUVmh3KApOpZe92nI8z8Ci9mIxTo10R58t8qRjbbbdvegicfROkZt2qjLffdLB3W6b1pGQACwhC7DW9lQ54mTnUbpqFb2e1Q62MCd/+ACgJqg1uX3DwfSAW/UqnZPPMNBXyMBHbe27kWeP6voKIdybDntMKQtwGv7fVg6qCN+o1kFMaoAoGtG52XijvGgdJBRYx0JmJb2Ou/ktqlh/wHWA/iodNAmJ4RuMtjoWtBo1kGWAUx71Y6yt5GNIR1b2I82czBBQH1dujyXydh20RxjMaCViYv1s65JLhkExImYWftL3znmFELc+Xdt/DY55z+ku4F8Lk1p7/FYhgG3TSZwte1U5s7/IQWjB32MBAzx2OK92ssgoGxYfX2b0lKd979dRmZUAUCcaP8oq5VLnB52jWhzI424MJZautfHcr+Rl7pdSm5+Urp5WNiUvA6XDoQH2vm/UkcCWifPDfzY9laZxHmZmvV/WDqo033TMjJGAJY0i2i7BgGZtR2d+p1Ff76PxJNMCio6/1fi9ewUABj+36w6GrfUNVi36G7KcN1rO8LYNbN91fqYummrBkZd3N/mDY8uIgBooa8gIHd0K7Xq2yX/X+fEk1wOtMmkoFQrAg5FU9p7afh/45YaBagbPnVa9bEG12tHvpQ6vL1fBq5O3TRljfoY+u867TpkAoCW+goC6sk1ueBHHnVNPMmLYAPLgQZtbj/3NkaTBbzN4j1cKImzp41f1mU/N1Ra9IfrsW3LtZ0BTqfE22Xk69hl6H+210oZMVsBd5BBQK2a1+kkyc1cIpj47nSp1zrvv/A0wVnqutfDwmldArefCpfK8zfO6Ul8+lM2pjXoakp/d6v7GYBfthQzrtHD0lOxpziGx/Hp5Nq1a38EgXH9Xq+7kOZWu5+cvo5b/D8ZrEwW+dl6bIPd/2TOWqtSZmAUr2On1RXRJn+5ysJeQyAA6G4/l/HkNqylpWzAbty4cSsakdeSeLKaW5cTMJcExYd7hb79b+Ei9+PcPTqvalxNWDssPdTIqJs5HZ33/Trk3On/mVVWjGt8csGP5bE+isfndbrhiw6BwKtRgMs6yz6Obd4sYMuqhrOvxb+zPcpKgfulhfo373Tdt2RZPQR9o9jq9zICgH7kBiUv44RpfbeejWU0HHdmFd66Rsu1kZWpfr6mtDTfQPKnWonw1mXnbc2fOIhz9DCn0TreMV+Y11JLPXfxICuALlNgKQs1xbFNcsVQjhKWFhYZBaidXB8mdXOxyXk/kO1JfS0XCmzmq1Kue7OsGoC1DozqyOsotvq9jByAntQs107zjNlwxIf7eQJ2mfe33I9NyPnSZYLWuT0xWrusM+o495/lbg/adGBzm361zRfZXyC/qNN8er07/3iRWhJ5PNk+xTG9Wy5PXH71c9mGrbvz7yPfY1PFvTZBANCjrmt5U0TMh10TTyLy7pT5ugvyDqW01DGBcKyO2qxUyZGveC+63G3987xv1CmwprRQN37plH8z2/67tNj0K12082hNFGxKS7NKosuOMuYxZeJyjhic8e35qpTTsgFdh/43Xdxr3QQA/TtaJov3tLzAupyAQ874Pz4+XuvdwEXiNRrMcxmDLtXRoiNayVxrl+H/vjZ+yb8Rne2lS33PeQ77530vXrPWSxr7qCQ6V4q61ATPO5uuSlkTnrvcgI1uq9/LCABWIC6Ih5uoi93HjlcrNphONxrA1vP4m95PYYAmXTqTOkw8KT1bdJngGV72ufFLhwDno5bfu1Bmt/cR3OTWuHnHHMf3zqYT5roW+hnrVr+XGVsS4FA6mFdz8HFSvruuObC5rUBZQJcRgK7LvMYmGs/OuyLG3/j+jXbVGZsLvrdf2j2XaU0k69O0LD80fT2v67M66w7JhbmxTS+ddX1eh2UArl69+rBLMbgcwdjFzb1GFQBEJPpTRLdlIJo+9ghYVF9rnVdsSMPu09LeuQ3zLso9LEp3vZ4bNYGuVYdQO9feKvR1ER1b5jhM579WcxvaelxGJqc9u4zK1RVXa12mOBSmAFZrfxX1vk/rYe5rLdadEXyRuOinpYO6/pwTg9sYqYdiT4MQNzV/O/21CPab0lKct6Pq6KLj7zTt2XXF1bYbVQDQtVFfhboyYGWdRZ37Gv2GFX2L+b62y7Neiff1kwKr15z+Qpeh7k0m6a1Cl+m4Xdjq9zJGANbjq1UlBW7RvP+0DEgdvp+W9va61oFgderWvGPVlHamhT/0lQy5zcYWAEzLMGXlsod9dxhdK12tU5d196sSnUSX5LVWNemBQXi8C1v9XsYIwJpkYlHMS/aWD7AFS/5eM8R197VQTZff/8woAGylj27cuLHzy3lHFQDEHdm0DFhuF9xXPsAWLvkbXKJYjAB0TYi63mdQ14YA5Gwj3+hpWtppCjNZwfHhrl8/owoAjo+Pp2X4OucDbNPQ/0xm25aB6WMDmgzquuz82FUEgt9FUPmi49Kw0fn111+nZRz6Xh7ZlBHp2K7kUu27ZYeNbQpgG6L+3CSo9RrjbRv6nzPU96bVNq3zsu74JhrWuUCwqYHAV2Nr4DsYxQhAjGq+OP21uHNtvYJlbMtXc+VXXH9dajYcxHW0s7k8owoA6h3dNlz4+21PukwmLNtpWgYo7hQnpfs509SdH5uyJrn3wxmB4EE8jxfr2Hti6Gp299YHATGqedaW1dPS0hiXrz579iyT+SalpaweuKv5AGPbCjjlRT/4eZ086aLDeLTMMpTcnrTtFqCbNtT8jAwa43W937WEaPkzCFh5KdG68dO5Gcx174mD+PSwzz3tt1DeKe+Xdj6PO8uN562cVWExz9l4f6el3TTgfk5Z9bEfQN1+/KMhnGO5j3+OgpV2bf8sH2BtW7cPxRgDgGnZjvnx2VTAQhtR9FHnepOGVAnwtCzWEu9FdqpdA8dXQUA0zivpeDNhqZZ6XmT0qInHUQYC2Tju4nrnDvUF0su4sxxs8BTH9jhXoZQW6pRV584uzsXcffQwAorP4/q+tclzLP/veB634tjaJkfP8gF2qiDQ6JYBdqnytgELbxVcT86mbK9pGahsCNuWbD1DU0463l7n4/OuLe9wWpR6zt97sYv5AR23vT0ccoZ4x2Nr4ve/7nJ8cT59OpuCyn34h3CO1VGNLtfxzuUDjC4AGOJ2wBfJiyga97vnXTj59biwMqrd5uSdl0MfWstRgJ5XKhzMGsW2Sz+zgc7h/nz/651NU9rL5/P1LjVwtUNoe941XZJ1T8vpuz47x7jjzqmBLhUt92oQ0JQl1SmoozO+tfEclBh5y6mb1kmSdWq2KTtirFMAWyWXksWFczMurMmstGqciG+Vk/nLfGz7WtXWF+S6ZIASgdjtDkOI5znIR7y3syWHk3hvc2j6ZbznL7/55ptp/tCHH37Y5Mdffvklczz+UU4Cvvy8z/c+p5HuxnP5JBrKndgDPUd2Okyd5TX5sE6htO5ss0PMQD/e7/z8MILN+10D4pq78qDtNEDKIKAGhffjOR1d9pxyFCpez3wt9y/5uxvNQYljudUlH2Ddpdw36Y0yMrkeur75DMfjaAi2YgQjGq5MrmvdqG6DuPN798mTJ68FZTWh60VpIRr8j7smlWXH2LajjnPr3Hasy3HNmZYWndkFHea09NA59nRsM68FqLMvZk2FmnicZYn3y/KmEUBdmhj77rvvHtWcgmVNzgpmc6Qrg93SUvzuvTinuywv3ApjXQXAgHQZklu3aKwOoyH6pEuVsSHL2uenO/8xy44nR9ZK+9UAqSkneR2H5aSTfJyrWs4IonJnyL3oND+Kf968oEb9H38vzrdbZ2X6L6KnY5vJu+UM0vN5//HFOF9KR02dCjuKY11b8Z1cGhj/Z77+rcqk56hsBBE/1CWGozW6HICxrP8dmWnZEjnsV0uEju4cykBsF2uf5xB+6UdTTqZ0HsY5khsv/Z6P6Ciyg/s9Orr/zSmkHAJfcLlu5w2c6rFtw7k6y4lp1SG3Ea/N513yenYhH2CUxYCGuO3sLht6jYbTahA5quVAeU3k3GjZQfl+xvF/WVakh9Gi1slz9dj6WsGyctEpd6nAuZQM5qPt6XIdz/IBtj0H61xjDQC+LwxGzVjeKjGv+CjOo1EEAbXz//j5Du4FMLOCVR69q8lzS98lxzD14TZMs+X007rPwcxN6bhVcLPpgl+rNMoAYNuWAo7c4JcAnica1qNtDwJ0/ie2aGqniffssCypju4M+dgmm5p+6rpVcM0HGOXy2bEGADuT5LQFtvq9yCAgPgy9cT2Tzv912zC1M3vPypLy2KLdG+QUTx5Tj3kYrXTNlRhrPsAoA4B4swUAAzGG6ZicDohz6t0tyy2ZREfyrs7/dUOe2onn9bJLwFaHuwd1bEMJQnsI/kaZDzDKAMBKgOHI3cbKCOQ5Ve/MtqG4zv1cG71rhU0WNTe1M5jXp6+OckjHNrQRqAz+SretgkeXDzDKACDFife4sHHHx8dry/pdtWzIohE5yAZ2iKMB+ZxyU57cDrVwoewohzKqM9dR9jJyOZBjG+QIVO7z0eV1GVs+wGgDgBiuOSps2mSMd6HZwNbRgEEsv8qh48ywjuf1Th9lXnfFQEZ17q+io9zUsdVz8c5QR6DyOUXf0CmnZ0z5AKMNALoWy6AXR2Wk6mjA53FH8U7880E2fGXNZh1/NPTv7OIGP32Yjeqs+455frRmVR3lBkasXt31x7k46N3zcgfHjvtCjCYfYLQBQM8lXllSNjibKASybrNGNhu+2tCuIwF1Eo/PZx2/uf7ucvg9R1DKyYqPSVmdSTwO1jlakyNW+f+tMBCY1GBma1acdF0aWEaSDzDGWgB/yM0/IlIb7SYOQxYNwqTskNrwHeWjFmn5pNT94OO16HSnUO/0M7DI1QgPVtTh5988Ki1kZcPSUT2+o7JhNVHs0fx7WDrutV/v9h/H49Emp2jqktajWqQoRwY+aruLYR7TlStXHkQneDSraNlFbS9+b/F7P5SWsg5DvMetCwbFa3D9xo0be9tcW2N01QBP24XqbkNj/fnrspHIqmrlpCPJUr/X4zVqzvnxWWf/U44mRAP1fJeK9wzRrMhPvB9ZEW+vnGzWk0HdWYHda+/fX/7yl0kfHeSq5LkZHeHerOLfOcf1sm6u9sM2HBOLG30AkBdvLZk5qvWbQ5bz0uakAYbtzTJyP/74489vv/32/4tO6f8UVq7O/e9k0RmAbTLaJMB5PSR8sKA225gCsH47EQCk3At6y7Zy3Tq5/te8P8B22JkAIDumrhtAcL467z/o9b8A/Gn0SYCn1Yzs3J9eUmB/HuRa+ALA1ti5ACAJAnql8wfYQjszBTAv11VvYXnXwclhf50/wHYa/TLA8/z4448v//73vz++cuXK38rJ5h4sqO5M9z/R+f/fAsBW2skpgNPee++9g/jwRdttMXdMbkcr2x9gywkAqrr392F8+mnhLJOa6T8pAGw9AcAps0CgS6GMkdHxA4yQAOACfVTN2jZrqjwHwIYJABZ0qiJY1g3/Zx+lXjeplinNzv4HlecAdosAoKO5wOD6XEAwK6vZbDJAqMscXytPmrXbr1279lw5T4DdJgBYgw8//LA5Pj5u8vOsCx+d8FvRGf+tBgdv1R9rFvxz07nPs1N/OfvalStXphGMvPpcBw8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQM/+PyzSMuHhf3zvAAAAAElFTkSuQmCC"
    ),
  };
  const textures = [
    {
      texture: availableTextures.slide1,
      typeId: ContentTypes.BLUE,
      maskId: CubeMasks.M1,
    },
    {
      texture: availableTextures.slide1,
      typeId: ContentTypes.BLUE,
      maskId: CubeMasks.M2,
    },
    {
      texture: availableTextures.slide1,
      typeId: ContentTypes.BLUE,
      maskId: CubeMasks.M3,
    },
    {
      texture: availableTextures.slide1,
      typeId: ContentTypes.BLUE,
      maskId: CubeMasks.M4,
    },
    {
      texture: availableTextures.slide1,
      typeId: ContentTypes.BLUE,
      maskId: CubeMasks.M5,
    },
    {
      texture: availableTextures.slide1,
      typeId: ContentTypes.BLUE,
      maskId: CubeMasks.M6,
    },
  ];

  let nextTextureName: string;
  setInterval(() => {
    if (nextTextureName) {
      const masks = visibleMasks(factor);
      for (const texture of textures) {
        if (!masks.includes(texture.maskId)) {
          // @ts-ignore
          texture.texture = availableTextures[nextTextureName] as any;
        }
      }
    }
  }, 100);

  const setNextTexture = (name: string) => {
    nextTextureName = name;
  };

  const visibleMasks = (factor: number) => {
    if (factor < 0.9) return [CubeMasks.M1, CubeMasks.M2, CubeMasks.M3];
    if (factor < 1.05) return [CubeMasks.M1, CubeMasks.M2];
    if (factor < 1.3) return [CubeMasks.M2, CubeMasks.M3];
    if (factor < 2) return [CubeMasks.M2, CubeMasks.M3, CubeMasks.M6];
    if (factor < 2.2) return [CubeMasks.M3, CubeMasks.M6];
    if (factor < 2.45) return [CubeMasks.M3, CubeMasks.M4, CubeMasks.M6];
    if (factor < 2.9) return [CubeMasks.M3, CubeMasks.M4];
    if (factor < 3.05) return [CubeMasks.M4, CubeMasks.M1];
    if (factor < 3.2) return [CubeMasks.M4, CubeMasks.M5, CubeMasks.M1];
    if (factor < 3.6) return [CubeMasks.M4, CubeMasks.M5];
    if (factor < 3.8) return [CubeMasks.M4, CubeMasks.M5, CubeMasks.M6];
    if (factor < 3.95) return [CubeMasks.M5, CubeMasks.M6];
    if (factor < 4.6) return [CubeMasks.M5, CubeMasks.M6, CubeMasks.M2];
    if (factor < 4.75) return [CubeMasks.M2, CubeMasks.M6];
    if (factor < 5) return [CubeMasks.M2];
    return [1, 2, 3];
  };

  let factor = 0;
  const radX = 0;
  const radY = 0;

  let fps = Date.now();
  let skipFrames = false;
  let offset = 0;

  function enableFrameSkip() {
    skipFrames = true;
  }

  function disableFrameSkip() {
    skipFrames = false;
  }

  const animate = ({ viewportWidth, viewportHeight, tick }: any) => {
    const {
      rotation,
      rotateX,
      rotateY,
      rotateZ,
      velocity,
      cameraX,
      cameraY,
      cameraZ,
    } = CONFIG;
    /**
     * Resize Fbos
     */
    displacementFbo.resize(viewportWidth, viewportHeight);
    maskFbo.resize(viewportWidth, viewportHeight);
    contentFbo.resize(viewportWidth, viewportHeight);

    /**
     * Rotation Matrix
     */
    if (skipFrames && tick % 2 == 0) {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      factor = ((tick + offset + 0.5) * velocity) % (Math.PI * 2);
      offset -= 1;
    } else {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      factor = ((tick + offset) * velocity) % (Math.PI * 2);
    }
    const rotationMatrix = mat4.create();

    mat4.rotate(rotationMatrix, rotationMatrix, rotation, [
      rotateX,
      rotateY,
      rotateZ,
    ]);
    mat4.rotate(rotationMatrix, rotationMatrix, factor, [
      Math.cos(factor),
      Math.sin(factor),
      0.5,
    ]);

    /**
     * Camera config
     */
    const cameraConfig = {
      eye: [cameraX, cameraY, cameraZ],
      target: [0, 0, 0],
    };

    /**
     * Clear context
     */
    regl.clear({
      color: [0, 0, 0, 0],
      depth: 1,
    });

    camera(cameraConfig, () => {
      /**
       * Render the displacement into the displacementFbo
       * Render the mask into the displacementFbo
       */
      cube([
        {
          fbo: displacementFbo,
          cullFace: CubeFaces.BACK,
          typeId: CubeTypes.DISPLACEMENT,
          matrix: rotationMatrix,
        },
        {
          fbo: maskFbo,
          cullFace: CubeFaces.BACK,
          typeId: CubeTypes.MASK,
          matrix: rotationMatrix,
        },
      ]);

      /**
       * Render the content to print in the cube
       */
      contentFbo.use(() => {
        content({
          textures,
          displacement: displacementFbo,
          mask: maskFbo,
        });
      });
    });

    /**
     * Render the content reflection
     */
    reflection({
      reflectionFbo,
      cameraConfig,
      rotationMatrix,
      texture: contentFbo,
    });

    camera(cameraConfig, () => {
      /**
       * Render the back face of the cube
       * Render the front face of the cube
       */
      cube([
        {
          cullFace: CubeFaces.FRONT,
          typeId: CubeTypes.FINAL,
          reflection: reflectionFbo,
          matrix: rotationMatrix,
        },
        {
          cullFace: CubeFaces.BACK,
          typeId: CubeTypes.FINAL,
          texture: contentFbo,
          matrix: rotationMatrix,
        },
      ]);
    });
    fps = Date.now();
  };

  const init = () => {
    play(animate);
  };
  init();

  const imageCycle = ["slide1", "slide2", "slide3", "slide4", "slide1"];
  let cycleHandler: number | null = null;
  const startCycle = () => {
    let cycleIndex = 0;
    // @ts-ignore
    cycleHandler = setInterval(() => {
      setNextTexture(
        imageCycle[(cycleIndex = (cycleIndex + 1) % imageCycle.length)]!
      );
    }, 3_000);
  };
  const stopCycle = () => clearInterval(cycleHandler ?? undefined);

  startCycle();
};

export const TheCube = () => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      initTheCube(ref.current);
    }
  }, []);

  return <canvas ref={ref} width="500" height="500"></canvas>;
};
