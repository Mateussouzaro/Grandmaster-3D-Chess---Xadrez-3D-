import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Chess, Square } from 'chess.js';
import { BoardTheme, PieceTheme } from '../../types/chess';
import { getPieceGeometry } from './pieceGeometries';
import { ChessCharacter } from '../../data/characters';

interface ChessCanvasProps {
  chess: Chess;
  boardTheme: BoardTheme;
  pieceTheme: PieceTheme;
  playerOrientation: 'w' | 'b';
  autoRotatePassAndPlay?: boolean;
  activeTurn: 'w' | 'b';
  onSquareClick?: (square: Square) => void;
  selectedSquare: Square | null;
  legalMoves: string[];
  lastMove: { from: string; to: string } | null;
  isCheck: boolean;
  checkedKingSquare: Square | null;
  whiteCharacter: ChessCharacter;
  blackCharacter: ChessCharacter;
}

export type CameraPreset = 'white' | 'black' | 'top' | 'iso';

export interface ChessCanvasRef {
  setCameraPreset: (preset: CameraPreset) => void;
  flipOrientation: () => void;
}

export const ChessCanvas = React.forwardRef<ChessCanvasRef, ChessCanvasProps>(
  (
    {
      chess,
      boardTheme,
      pieceTheme,
      playerOrientation,
      autoRotatePassAndPlay = false,
      activeTurn,
      onSquareClick,
      selectedSquare,
      legalMoves,
      lastMove,
      isCheck,
      checkedKingSquare,
      whiteCharacter,
      blackCharacter,
    },
    ref
  ) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const piecesGroupRef = useRef<THREE.Group | null>(null);
    const boardGroupRef = useRef<THREE.Group | null>(null);
    const markersGroupRef = useRef<THREE.Group | null>(null);
    const playersGroupRef = useRef<THREE.Group | null>(null);
    const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
    const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
    const activeTurnRef = useRef(activeTurn);

    useEffect(() => {
      activeTurnRef.current = activeTurn;
    }, [activeTurn]);

    // Camera orbit parameters
    const cameraAngleRef = useRef<{ theta: number; phi: number; radius: number }>({
      theta: playerOrientation === 'w' ? 0 : Math.PI,
      phi: Math.PI / 4, // 45 degrees elevation
      radius: 14.5,
    });
    const targetCameraAngleRef = useRef<{ theta: number; phi: number; radius: number }>({
      theta: playerOrientation === 'w' ? 0 : Math.PI,
      phi: Math.PI / 4,
      radius: 14.5,
    });

    const isDraggingRef = useRef(false);
    const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const touchDistanceRef = useRef<number | null>(null);

    // Map square name ('a1'..'h8') to 3D world position
    const squareToWorldPos = useCallback((square: string): THREE.Vector3 => {
      const file = square.charCodeAt(0) - 97; // 0 to 7 (a to h) -> x
      const rank = parseInt(square[1], 10) - 1; // 0 to 7 (1 to 8) -> z
      const x = (file - 3.5) * 1.0;
      const z = -(rank - 3.5) * 1.0;
      return new THREE.Vector3(x, 0.25, z);
    }, []);

    // Helper: World pos to square string
    const worldPosToSquare = useCallback((x: number, z: number): Square | null => {
      const file = Math.round(x + 3.5);
      const rank = Math.round(-z + 3.5);
      if (file >= 0 && file <= 7 && rank >= 0 && rank <= 7) {
        const fileChar = String.fromCharCode(97 + file);
        return `${fileChar}${rank + 1}` as Square;
      }
      return null;
    }, []);

    // Camera preset handler exposed via ref
    React.useImperativeHandle(ref, () => ({
      setCameraPreset: (preset: CameraPreset) => {
        if (preset === 'white') {
          targetCameraAngleRef.current.theta = 0;
          targetCameraAngleRef.current.phi = Math.PI / 4.2;
          targetCameraAngleRef.current.radius = 14.5;
        } else if (preset === 'black') {
          targetCameraAngleRef.current.theta = Math.PI;
          targetCameraAngleRef.current.phi = Math.PI / 4.2;
          targetCameraAngleRef.current.radius = 14.5;
        } else if (preset === 'top') {
          targetCameraAngleRef.current.phi = 0.05; // almost 90 deg down
          targetCameraAngleRef.current.radius = 10.0;
        } else if (preset === 'iso') {
          targetCameraAngleRef.current.theta = Math.PI / 4;
          targetCameraAngleRef.current.phi = Math.PI / 3.5;
          targetCameraAngleRef.current.radius = 12.0;
        }
      },
      flipOrientation: () => {
        targetCameraAngleRef.current.theta += Math.PI;
      },
    }));

    // Auto rotate on pass & play turn switch
    useEffect(() => {
      if (autoRotatePassAndPlay) {
        if (activeTurn === 'w') {
          targetCameraAngleRef.current.theta = 0;
        } else {
          targetCameraAngleRef.current.theta = Math.PI;
        }
      }
    }, [activeTurn, autoRotatePassAndPlay]);

    // Initial Three.js Scene Setup
    useEffect(() => {
      const container = mountRef.current;
      if (!container) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      // 1. Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // 2. Camera
      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      cameraRef.current = camera;

      // 3. Renderer with antialiasing and shadow map
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // 4. Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xfff8ee, 1.8);
      dirLight.position.set(5, 12, 7);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 2048;
      dirLight.shadow.mapSize.height = 2048;
      dirLight.shadow.bias = -0.0005;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 30;
      dirLight.shadow.camera.left = -6;
      dirLight.shadow.camera.right = 6;
      dirLight.shadow.camera.top = 6;
      dirLight.shadow.camera.bottom = -6;
      scene.add(dirLight);

      const rimLight = new THREE.DirectionalLight(0x8bc34a, 0.4);
      rimLight.position.set(-6, 8, -6);
      scene.add(rimLight);

      // Groups
      const boardGroup = new THREE.Group();
      scene.add(boardGroup);
      boardGroupRef.current = boardGroup;

      const piecesGroup = new THREE.Group();
      scene.add(piecesGroup);
      piecesGroupRef.current = piecesGroup;

      const markersGroup = new THREE.Group();
      scene.add(markersGroup);
      markersGroupRef.current = markersGroup;

      const playersGroup = new THREE.Group();
      scene.add(playersGroup);
      playersGroupRef.current = playersGroup;

      // Animation loop
      let animationFrameId: number;
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        // Smooth camera lerp
        const cur = cameraAngleRef.current;
        const tgt = targetCameraAngleRef.current;
        cur.theta += (tgt.theta - cur.theta) * 0.1;
        cur.phi += (tgt.phi - cur.phi) * 0.1;
        cur.radius += (tgt.radius - cur.radius) * 0.1;

        // Clamp phi (elevation) to prevent flipping under board
        const clampedPhi = Math.max(0.08, Math.min(Math.PI / 2.1, cur.phi));

        const x = cur.radius * Math.sin(clampedPhi) * Math.sin(cur.theta);
        const y = cur.radius * Math.cos(clampedPhi);
        const z = cur.radius * Math.sin(clampedPhi) * Math.cos(cur.theta);

        camera.position.set(x, y, z);
        camera.lookAt(0, 0.3, 0);

        // Os jogadores participam da jogada: o personagem da vez se inclina e movimenta os braços em direção ao tabuleiro.
        const now = performance.now() * 0.003;
        playersGroupRef.current?.children.forEach((player) => {
          const isPlayerTurn = (player.userData.side === 'white' ? 'w' : 'b') === activeTurnRef.current;
          const phase = Math.sin(now) * 0.06;
          player.position.y = 0.1 + (isPlayerTurn ? Math.max(0, phase) : 0);
          player.rotation.x = isPlayerTurn ? 0.08 + phase : 0;
          player.children.forEach((part) => {
            if (part.userData.role === 'arm') {
              part.rotation.z = isPlayerTurn ? -0.28 + Math.sin(now * 1.8) * 0.1 : 0;
              part.rotation.x = isPlayerTurn ? 0.18 : 0;
            }
          });
        });

        renderer.render(scene, camera);
      };
      animate();

      // Resize handler
      const handleResize = () => {
        if (!container) return;
        const newW = container.clientWidth;
        const newH = container.clientHeight;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    }, []);

    // Rebuild Board when boardTheme changes
    useEffect(() => {
      const boardGroup = boardGroupRef.current;
      if (!boardGroup) return;

      while (boardGroup.children.length > 0) {
        const obj = boardGroup.children[0];
        boardGroup.remove(obj);
      }

      // 1. Board Frame (Wooden / Stone Beveled Base)
      const frameGeom = new THREE.BoxGeometry(9.4, 0.45, 9.4);
      const frameMat = new THREE.MeshStandardMaterial({
        color: boardTheme.frameColor,
        roughness: 0.4,
        metalness: 0.1,
      });
      const frameMesh = new THREE.Mesh(frameGeom, frameMat);
      frameMesh.position.y = 0.05;
      frameMesh.receiveShadow = true;
      boardGroup.add(frameMesh);

      // Inner bevel accent
      const rimGeom = new THREE.BoxGeometry(8.4, 0.04, 8.4);
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.2,
        metalness: 0.6,
      });
      const rimMesh = new THREE.Mesh(rimGeom, rimMat);
      rimMesh.position.y = 0.26;
      rimMesh.receiveShadow = true;
      boardGroup.add(rimMesh);

      // 2. Individual Squares (64 tiles)
      const lightMat = new THREE.MeshStandardMaterial({
        color: boardTheme.lightSquare,
        roughness: 0.32,
        metalness: 0.05,
      });
      const darkMat = new THREE.MeshStandardMaterial({
        color: boardTheme.darkSquare,
        roughness: 0.32,
        metalness: 0.05,
      });

      const tileGeom = new THREE.BoxGeometry(0.98, 0.12, 0.98);

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const isLight = (r + c) % 2 === 1;
          const squareMesh = new THREE.Mesh(tileGeom, isLight ? lightMat : darkMat);
          const x = (c - 3.5) * 1.0;
          const z = -(r - 3.5) * 1.0;
          squareMesh.position.set(x, 0.24, z);
          squareMesh.receiveShadow = true;

          const fileChar = String.fromCharCode(97 + c);
          squareMesh.name = `square_${fileChar}${r + 1}`;
          boardGroup.add(squareMesh);
        }
      }
    }, [boardTheme]);

    // Rebuild the two seated players around the board.
    useEffect(() => {
      const group = playersGroupRef.current;
      if (!group) return;
      group.clear();

      const addPlayer = (character: ChessCharacter, side: 'white' | 'black') => {
        const isWhite = side === 'white';
        const x = isWhite ? -4.0 : 4.0;
        const z = 0;
        const rotation = isWhite ? Math.PI / 2 : -Math.PI / 2;
        const color = new THREE.Color(character.color);
        const darkColor = color.clone().multiplyScalar(0.45);
        const skin = new THREE.MeshStandardMaterial({ color: 0xc98f70, roughness: 0.8 });
        const outfit = new THREE.MeshStandardMaterial({ color, roughness: 0.62 });
        const darkOutfit = new THREE.MeshStandardMaterial({ color: darkColor, roughness: 0.7 });
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        group.rotation.y = rotation;

        const add = (geometry: THREE.BufferGeometry, material: THREE.Material, px: number, py: number, pz: number, scale = 1) => {
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(px, py, pz);
          mesh.scale.setScalar(scale);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          group.add(mesh);
        };

        add(new THREE.CylinderGeometry(0.58, 0.72, 1.25, 20), outfit, 0, 1.35, 0);
        add(new THREE.SphereGeometry(0.43, 20, 16), skin, 0, 2.32, 0);
        add(new THREE.SphereGeometry(0.45, 20, 12), darkOutfit, 0, 2.62, -0.02, 0.72);
        add(new THREE.CapsuleGeometry(0.13, 0.68, 8, 12), skin, 0.46, 1.52, -0.34);
        add(new THREE.CapsuleGeometry(0.13, 0.68, 8, 12), skin, 0.56, 1.42, -0.12);
        group.children[3].userData.role = 'arm';
        group.children[4].userData.role = 'arm';
        add(new THREE.CapsuleGeometry(0.18, 0.82, 8, 12), darkOutfit, -0.3, 0.47, 0.05);
        add(new THREE.CapsuleGeometry(0.18, 0.82, 8, 12), darkOutfit, 0.3, 0.47, 0.05);
        add(new THREE.BoxGeometry(0.9, 0.18, 0.9), darkOutfit, 0, 0.08, 0.25);

        const badge = new THREE.Mesh(new THREE.CircleGeometry(0.22, 20), new THREE.MeshBasicMaterial({ color }));
        badge.position.set(0, 1.4, -0.61);
        badge.rotation.y = Math.PI;
        group.add(badge);
        group.userData = {
          characterId: character.id,
          characterName: character.name,
          side,
        };
        group.position.y = 0.1;
        group.add(new THREE.AmbientLight(character.color, 0.18));
        playersGroupRef.current?.add(group);
      };

      addPlayer(whiteCharacter, 'white');
      addPlayer(blackCharacter, 'black');
    }, [whiteCharacter, blackCharacter]);

    // Rebuild Pieces when board position (chess FEN) or pieceTheme changes
    useEffect(() => {
      const piecesGroup = piecesGroupRef.current;
      if (!piecesGroup) return;

      while (piecesGroup.children.length > 0) {
        const obj = piecesGroup.children[0];
        piecesGroup.remove(obj);
      }

      const whiteMat = new THREE.MeshStandardMaterial({
        color: pieceTheme.whiteColor,
        roughness: pieceTheme.whiteRoughness,
        metalness: pieceTheme.whiteMetalness,
      });

      const blackMat = new THREE.MeshStandardMaterial({
        color: pieceTheme.blackColor,
        roughness: pieceTheme.blackRoughness,
        metalness: pieceTheme.blackMetalness,
      });

      const board = chess.board();

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = board[r][c];
          if (!piece) continue;

          const rankNum = 8 - r;
          const fileChar = String.fromCharCode(97 + c);
          const squareStr = `${fileChar}${rankNum}`;

          const geom = getPieceGeometry(piece.type);
          const mat = piece.color === 'w' ? whiteMat : blackMat;
          const pieceMesh = new THREE.Mesh(geom, mat);

          const pos = squareToWorldPos(squareStr);
          pieceMesh.position.copy(pos);
          pieceMesh.castShadow = true;
          pieceMesh.receiveShadow = true;

          // Orient knights to face enemy rank
          if (piece.type === 'n') {
            pieceMesh.rotation.y = piece.color === 'w' ? 0 : Math.PI;
          }

          pieceMesh.name = `piece_${squareStr}`;
          pieceMesh.userData = { square: squareStr, piece };

          piecesGroup.add(pieceMesh);
        }
      }
    }, [chess, pieceTheme, squareToWorldPos]);

    // Rebuild Visual Markers: selected square highlight, legal moves, check indicator, last move
    useEffect(() => {
      const markersGroup = markersGroupRef.current;
      if (!markersGroup) return;

      while (markersGroup.children.length > 0) {
        const obj = markersGroup.children[0];
        markersGroup.remove(obj);
      }

      // 1. Last Move Highlights (Pale Blue Glow on 'from' and 'to')
      if (lastMove) {
        const lastMoveGeom = new THREE.PlaneGeometry(0.96, 0.96);
        const lastMoveMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.28,
        });
        [lastMove.from, lastMove.to].forEach((sq) => {
          const pos = squareToWorldPos(sq);
          const mesh = new THREE.Mesh(lastMoveGeom, lastMoveMat);
          mesh.rotation.x = -Math.PI / 2;
          mesh.position.set(pos.x, 0.31, pos.z);
          markersGroup.add(mesh);
        });
      }

      // 2. Selected Square Highlight (Warm Amber Glow)
      if (selectedSquare) {
        const selGeom = new THREE.PlaneGeometry(0.96, 0.96);
        const selMat = new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          transparent: true,
          opacity: 0.45,
        });
        const pos = squareToWorldPos(selectedSquare);
        const selMesh = new THREE.Mesh(selGeom, selMat);
        selMesh.rotation.x = -Math.PI / 2;
        selMesh.position.set(pos.x, 0.32, pos.z);
        markersGroup.add(selMesh);

        // Golden square border
        const edges = new THREE.EdgesGeometry(selGeom);
        const lineMat = new THREE.LineBasicMaterial({ color: 0xfbbf24, linewidth: 3 });
        const line = new THREE.LineSegments(edges, lineMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(pos.x, 0.322, pos.z);
        markersGroup.add(line);
      }

      // 3. Legal Moves (Circles for empty squares, Crimson rings for captures)
      if (legalMoves.length > 0) {
        const dotGeom = new THREE.CylinderGeometry(0.16, 0.16, 0.04, 24);
        const dotMat = new THREE.MeshBasicMaterial({
          color: 0x10b981,
          transparent: true,
          opacity: 0.75,
        });

        const ringGeom = new THREE.RingGeometry(0.32, 0.44, 28);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xef4444,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
        });

        legalMoves.forEach((sq) => {
          const pieceAtTarget = chess.get(sq as Square);
          const pos = squareToWorldPos(sq);

          if (pieceAtTarget) {
            // Capture ring
            const ringMesh = new THREE.Mesh(ringGeom, ringMat);
            ringMesh.rotation.x = -Math.PI / 2;
            ringMesh.position.set(pos.x, 0.33, pos.z);
            markersGroup.add(ringMesh);
          } else {
            // Free move dot
            const dotMesh = new THREE.Mesh(dotGeom, dotMat);
            dotMesh.position.set(pos.x, 0.33, pos.z);
            markersGroup.add(dotMesh);
          }
        });
      }

      // 4. Check Indicator (Red pulsing halo under checked king)
      if (isCheck && checkedKingSquare) {
        const checkGeom = new THREE.PlaneGeometry(0.96, 0.96);
        const checkMat = new THREE.MeshBasicMaterial({
          color: 0xdc2626,
          transparent: true,
          opacity: 0.55,
        });
        const pos = squareToWorldPos(checkedKingSquare);
        const checkMesh = new THREE.Mesh(checkGeom, checkMat);
        checkMesh.rotation.x = -Math.PI / 2;
        checkMesh.position.set(pos.x, 0.325, pos.z);
        markersGroup.add(checkMesh);
      }
    }, [selectedSquare, legalMoves, lastMove, isCheck, checkedKingSquare, chess, squareToWorldPos]);

    // Touch & Mouse Interaction Handlers
    const handlePointerDown = (clientX: number, clientY: number) => {
      isDraggingRef.current = false;
      dragStartRef.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (clientX: number, clientY: number) => {
      const dx = clientX - dragStartRef.current.x;
      const dy = clientY - dragStartRef.current.y;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        isDraggingRef.current = true;
      }

      if (isDraggingRef.current) {
        // Rotate orbit
        targetCameraAngleRef.current.theta += dx * 0.007;
        targetCameraAngleRef.current.phi += dy * 0.007;
        // Clamp phi between ~5 deg and 85 deg
        targetCameraAngleRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2.15, targetCameraAngleRef.current.phi));

        dragStartRef.current = { x: clientX, y: clientY };
      }
    };

    const handlePointerUp = (clientX: number, clientY: number) => {
      if (!isDraggingRef.current) {
        // Pure Tap/Click: Perform Raycast to find clicked square
        performRaycast(clientX, clientY);
      }
      isDraggingRef.current = false;
    };

    const performRaycast = (clientX: number, clientY: number) => {
      const container = mountRef.current;
      const camera = cameraRef.current;
      const scene = sceneRef.current;
      if (!container || !camera || !scene) return;

      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      // Intersect with board plane at y = 0.25
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.25);
      const targetPoint = new THREE.Vector3();
      const hit = raycasterRef.current.ray.intersectPlane(plane, targetPoint);

      if (hit) {
        const sq = worldPosToSquare(hit.x, hit.z);
        if (sq && onSquareClick) {
          onSquareClick(sq);
        }
      }
    };

    // Touch Event Handlers
    const onTouchStart = (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2) {
        // Pinch zoom start
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        touchDistanceRef.current = dist;
      }
    };

    const onTouchMove = (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2 && touchDistanceRef.current !== null) {
        // Pinch zoom
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const diff = touchDistanceRef.current - dist;
        targetCameraAngleRef.current.radius = Math.max(6.5, Math.min(18.0, targetCameraAngleRef.current.radius + diff * 0.02));
        touchDistanceRef.current = dist;
      }
    };

    const onTouchEnd = (e: React.TouchEvent) => {
      if (e.changedTouches.length > 0) {
        handlePointerUp(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
      touchDistanceRef.current = null;
    };

    // Mouse Event Handlers
    const [isMouseDown, setIsMouseDown] = useState(false);

    const onMouseDown = (e: React.MouseEvent) => {
      setIsMouseDown(true);
      handlePointerDown(e.clientX, e.clientY);
    };

    const onMouseMove = (e: React.MouseEvent) => {
      if (isMouseDown) {
        handlePointerMove(e.clientX, e.clientY);
      }
    };

    const onMouseUp = (e: React.MouseEvent) => {
      setIsMouseDown(false);
      handlePointerUp(e.clientX, e.clientY);
    };

    const onWheel = (e: React.WheelEvent) => {
      targetCameraAngleRef.current.radius = Math.max(6.5, Math.min(18.0, targetCameraAngleRef.current.radius + e.deltaY * 0.008));
    };

    return (
      <div
        ref={mountRef}
        className="w-full h-full relative cursor-grab active:cursor-grabbing select-none overflow-hidden touch-none"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onWheel={onWheel}
      />
    );
  }
);

ChessCanvas.displayName = 'ChessCanvas';
