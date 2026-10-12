import * as THREE from 'three';

/**
 * Creates authentic Staunton-inspired procedural 3D geometries for chess pieces
 * using LatheGeometry (revolved profile curves) and composite shapes.
 */

// Cache geometries so we don't recreate them for all 32 pieces
const geometryCache: Record<string, THREE.BufferGeometry> = {};

export function getPieceGeometry(type: string): THREE.BufferGeometry {
  if (geometryCache[type]) {
    return geometryCache[type];
  }

  let geom: THREE.BufferGeometry;

  switch (type.toLowerCase()) {
    case 'p': // Pawn
      geom = createPawnGeometry();
      break;
    case 'r': // Rook
      geom = createRookGeometry();
      break;
    case 'n': // Knight
      geom = createKnightGeometry();
      break;
    case 'b': // Bishop
      geom = createBishopGeometry();
      break;
    case 'q': // Queen
      geom = createQueenGeometry();
      break;
    case 'k': // King
      geom = createKingGeometry();
      break;
    default:
      geom = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 16);
  }

  geometryCache[type] = geom;
  return geom;
}

function createPawnGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.36, 0));
  points.push(new THREE.Vector2(0.36, 0.08));
  points.push(new THREE.Vector2(0.30, 0.12));
  points.push(new THREE.Vector2(0.25, 0.22));
  points.push(new THREE.Vector2(0.16, 0.45));
  points.push(new THREE.Vector2(0.14, 0.65));
  points.push(new THREE.Vector2(0.22, 0.72));
  points.push(new THREE.Vector2(0.20, 0.76));
  points.push(new THREE.Vector2(0.14, 0.78));
  // Head sphere
  const headRadius = 0.19;
  const headCenterY = 0.95;
  for (let a = -Math.PI / 2; a <= Math.PI / 2; a += Math.PI / 10) {
    points.push(new THREE.Vector2(Math.cos(a) * headRadius, headCenterY + Math.sin(a) * headRadius));
  }
  points.push(new THREE.Vector2(0, headCenterY + headRadius));

  const lathe = new THREE.LatheGeometry(points, 28);
  lathe.computeVertexNormals();
  return lathe;
}

function createRookGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.40, 0));
  points.push(new THREE.Vector2(0.40, 0.10));
  points.push(new THREE.Vector2(0.32, 0.16));
  points.push(new THREE.Vector2(0.27, 0.3));
  points.push(new THREE.Vector2(0.24, 0.75));
  points.push(new THREE.Vector2(0.32, 0.82));
  points.push(new THREE.Vector2(0.32, 1.15));
  points.push(new THREE.Vector2(0.22, 1.15));
  points.push(new THREE.Vector2(0.22, 1.0));
  points.push(new THREE.Vector2(0, 1.0));

  const lathe = new THREE.LatheGeometry(points, 28);
  lathe.computeVertexNormals();
  return lathe;
}

function createBishopGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.39, 0));
  points.push(new THREE.Vector2(0.39, 0.10));
  points.push(new THREE.Vector2(0.31, 0.16));
  points.push(new THREE.Vector2(0.25, 0.32));
  points.push(new THREE.Vector2(0.18, 0.75));
  points.push(new THREE.Vector2(0.28, 0.84));
  points.push(new THREE.Vector2(0.24, 0.88));
  // Ovoid mitre head
  points.push(new THREE.Vector2(0.23, 1.05));
  points.push(new THREE.Vector2(0.18, 1.25));
  points.push(new THREE.Vector2(0.06, 1.38));
  // Small finial orb at top
  points.push(new THREE.Vector2(0.08, 1.41));
  points.push(new THREE.Vector2(0, 1.48));

  const lathe = new THREE.LatheGeometry(points, 28);
  lathe.computeVertexNormals();
  return lathe;
}

function createKnightGeometry(): THREE.BufferGeometry {
  // Knight: base cylinder + sculpted horse head using combined shapes
  const basePoints: THREE.Vector2[] = [];
  basePoints.push(new THREE.Vector2(0, 0));
  basePoints.push(new THREE.Vector2(0.38, 0));
  basePoints.push(new THREE.Vector2(0.38, 0.10));
  basePoints.push(new THREE.Vector2(0.31, 0.16));
  basePoints.push(new THREE.Vector2(0.27, 0.35));
  basePoints.push(new THREE.Vector2(0.24, 0.45));
  basePoints.push(new THREE.Vector2(0, 0.45));

  const baseGeom = new THREE.LatheGeometry(basePoints, 24);

  // Sculpted head shape
  const headShape = new THREE.Shape();
  headShape.moveTo(-0.16, 0.4);
  headShape.lineTo(-0.24, 0.75); // back of neck
  headShape.lineTo(-0.22, 1.0);  // mane
  headShape.lineTo(-0.16, 1.18); // ears back
  headShape.lineTo(-0.10, 1.25); // tip of ear
  headShape.lineTo(-0.06, 1.15); // ear base
  headShape.lineTo(0.05, 1.05);  // brow
  headShape.lineTo(0.22, 0.88);  // muzzle top
  headShape.lineTo(0.20, 0.74);  // mouth
  headShape.lineTo(0.10, 0.70);  // chin
  headShape.lineTo(0.02, 0.52);  // throat
  headShape.lineTo(0.12, 0.40);  // chest
  headShape.closePath();

  const extrudeSettings = {
    depth: 0.22,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.04,
    bevelThickness: 0.04,
  };

  const headGeom = new THREE.ExtrudeGeometry(headShape, extrudeSettings);
  headGeom.translate(0, 0, -0.11); // Center extrusion

  // Merge base and head into a single BufferGeometry
  const merged = mergeBufferGeometries([baseGeom, headGeom]);
  merged.computeVertexNormals();
  return merged;
}

function createQueenGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.42, 0));
  points.push(new THREE.Vector2(0.42, 0.10));
  points.push(new THREE.Vector2(0.34, 0.18));
  points.push(new THREE.Vector2(0.27, 0.35));
  points.push(new THREE.Vector2(0.20, 0.85));
  points.push(new THREE.Vector2(0.28, 0.94));
  points.push(new THREE.Vector2(0.23, 0.98));
  points.push(new THREE.Vector2(0.33, 1.35)); // flared crown
  points.push(new THREE.Vector2(0.31, 1.40));
  points.push(new THREE.Vector2(0.10, 1.38));
  points.push(new THREE.Vector2(0.09, 1.48)); // top coronet ball
  points.push(new THREE.Vector2(0, 1.55));

  const lathe = new THREE.LatheGeometry(points, 32);
  lathe.computeVertexNormals();
  return lathe;
}

function createKingGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.44, 0));
  points.push(new THREE.Vector2(0.44, 0.11));
  points.push(new THREE.Vector2(0.36, 0.19));
  points.push(new THREE.Vector2(0.28, 0.40));
  points.push(new THREE.Vector2(0.21, 0.90));
  points.push(new THREE.Vector2(0.31, 1.0));
  points.push(new THREE.Vector2(0.27, 1.05));
  points.push(new THREE.Vector2(0.33, 1.35));
  points.push(new THREE.Vector2(0.26, 1.45));
  points.push(new THREE.Vector2(0.12, 1.48));
  points.push(new THREE.Vector2(0, 1.52));

  const lathe = new THREE.LatheGeometry(points, 32);

  // Cross finial at top
  const crossV = new THREE.BoxGeometry(0.06, 0.22, 0.06);
  crossV.translate(0, 1.63, 0);

  const crossH = new THREE.BoxGeometry(0.18, 0.06, 0.06);
  crossH.translate(0, 1.67, 0);

  const merged = mergeBufferGeometries([lathe, crossV, crossH]);
  merged.computeVertexNormals();
  return merged;
}

// Utility to combine geometries without needing external loaders
function mergeBufferGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let totalVertices = 0;
  let totalIndices = 0;

  geometries.forEach((geom) => {
    totalVertices += geom.attributes.position.count;
    if (geom.index) totalIndices += geom.index.count;
    else totalIndices += geom.attributes.position.count;
  });

  const positions = new Float32Array(totalVertices * 3);
  const normals = new Float32Array(totalVertices * 3);
  const indices: number[] = [];

  let vertexOffset = 0;

  geometries.forEach((geom) => {
    const pos = geom.attributes.position;
    const norm = geom.attributes.normal || pos; // fallback

    for (let i = 0; i < pos.count; i++) {
      positions[(vertexOffset + i) * 3] = pos.getX(i);
      positions[(vertexOffset + i) * 3 + 1] = pos.getY(i);
      positions[(vertexOffset + i) * 3 + 2] = pos.getZ(i);

      normals[(vertexOffset + i) * 3] = norm.getX(i);
      normals[(vertexOffset + i) * 3 + 1] = norm.getY(i);
      normals[(vertexOffset + i) * 3 + 2] = norm.getZ(i);
    }

    if (geom.index) {
      for (let i = 0; i < geom.index.count; i++) {
        indices.push(geom.index.getX(i) + vertexOffset);
      }
    } else {
      for (let i = 0; i < pos.count; i++) {
        indices.push(vertexOffset + i);
      }
    }

    vertexOffset += pos.count;
  });

  const result = new THREE.BufferGeometry();
  result.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  result.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  result.setIndex(indices);
  return result;
}
