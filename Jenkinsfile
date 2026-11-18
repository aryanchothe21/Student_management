pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        stage('Build Docker image') {
            steps {
                sh 'docker build -t student-management:${BUILD_NUMBER} .'
            }
        }
    }
}
