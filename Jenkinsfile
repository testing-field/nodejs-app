pipeline {
    environment {
        registry = "wdalmut/app1"
        registryCredential = 'dockerhub'
    }
    agent none

    stages {
        stage('Build & Test') {
            agent {
                docker { image 'node:12-alpine' }
            }
            steps {
                sh 'node --version'
                sh 'npm i'
                sh 'npm test'
            }
        }
        stage('Build Image') {
            steps {
                script {
                    dockerImage = docker.build registry + ":$BUILD_NUMBER"
                }
            }
        }
        stage('Deploy Image') {
            steps {
                script {
                    docker.withRegistry( '', registryCredential ) {
                        dockerImage.push()
                    }
                }
            }
        }
        stage('propose changes for Development') {
            agent any
            when {
                branch 'master'
            }
            environment {
                PR_NUMBER = "build-$BUILD_NUMBER"
            }
            steps {
                git branch: 'master', credentialsId: 'github', url: 'git@github.com:testing-field/gitops-dev-infrastructure.git'
                sh 'git config --global user.email "walter.dalmut@gmail.com"'
                sh 'git config --global user.name "Walter Dal Mut"'

                sh "git checkout -b feature/${PR_NUMBER}"

                sh 'kubectl patch -f app1/app.yaml -p \'{"spec":{"template":{"spec":{"containers":[{"name":"hello-pod","image":"'+ registry+":${BUILD_NUMBER}" +'"}]}}}}\' --local -o yaml | tee /tmp/app1.yaml'
                sh 'mv /tmp/app1.yaml app1/app.yaml'

                sh 'git add app1/app.yaml'

                sh 'git commit -m "[JENKINS-CI] - new application release"'

                sshagent(['github']) {
                    sh("""
                        #!/usr/bin/env bash
                        set +x
                        export GIT_SSH_COMMAND="ssh -oStrictHostKeyChecking=no"
                        git push origin feature/${PR_NUMBER}
                     """)
                }

                withCredentials([string(credentialsId: 'github_token', variable: 'GITHUB_TOKEN')]) {
                    sh 'hub pull-request -m "[JENKINS-CI] - Pull Request for image: "'+registry+":${BUILD_NUMBER}"
                }
            }
        }
    }
}
