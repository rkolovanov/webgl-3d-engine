export default
`
attribute vec3 a_vertexPosition;
attribute vec3 a_vertexNormal;

uniform mat4 u_mMatrix;
uniform mat4 u_vMatrix;
uniform mat4 u_pMatrix;
uniform mat4 u_nMatrix;

varying vec3 v_vertexPosition;
varying vec3 v_vertexNormal;

void main() {
    vec4 globalPosition = u_mMatrix * vec4(a_vertexPosition, 1.0);
    vec3 globalNormal = normalize((u_nMatrix * vec4(a_vertexNormal, 0.0)).xyz);
    
    gl_Position = u_pMatrix * u_vMatrix * globalPosition;
    
    v_vertexPosition = globalPosition.xyz;
    v_vertexNormal = globalNormal;
}
`;
