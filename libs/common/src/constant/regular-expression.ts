/**
 * REGEX_PASSWORD
 *
 * Minimum eight characters and maximum sixteen characters, at least one letter and one number
 * @link {https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a}
 * better ?! /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/
 * @description 비빌번호 규칙 정규식
 * 최소 8자 최대 16자리 , 최소 하나의 문자 및 하나의 숫자
 */
export const REGEX_PASSWORD = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
