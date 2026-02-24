pipeline {
  agent any

  environment {
    AWS_REGION = "ap-south-1"
    ACCOUNT_ID = "453183019852"
    IMAGE_NAME = "ihms-frontend"
    IMAGE_TAG  = "${BUILD_NUMBER}"
    ECR = "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    TRIVY_SERVER = "65.0.80.190 "
  }

  stages {

    stage('Checkout') {
      steps {
        git branch: 'main',
            url: 'https://github.com/bk-thakur/ihms-frontend.git'
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'npm install'
      }
    }

    stage('Build Application') {
      steps {
        sh 'npm run build'
      }
    }

    stage('SonarQube Scan') {
      steps {
        withSonarQubeEnv('SonarQube-Server') {
          sh """
            /opt/sonar-scanner/bin/sonar-scanner \
            -Dsonar.projectKey=ihms-frontend \
            -Dsonar.sources=src
          """
        }
      }
    }

    stage('Quality Gate Check') {
      steps {
        timeout(time: 3, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('Docker Build') {
      steps {
        sh """
          docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
        """
      }
    }

    stage('Login to ECR') {
      steps {
        sh """
          aws ecr get-login-password --region ${AWS_REGION} \
          | docker login --username AWS --password-stdin ${ECR}
        """
      }
    }

    stage('Tag & Push to ECR') {
      steps {
        sh """
          docker tag ${IMAGE_NAME}:${IMAGE_TAG} \
          ${ECR}/${IMAGE_NAME}:${IMAGE_TAG}

          docker push ${ECR}/${IMAGE_NAME}:${IMAGE_TAG}
        """
      }
    }

    stage('Remote Trivy Scan') {
      steps {
        sh """
          ssh -o StrictHostKeyChecking=no ubuntu@${TRIVY_SERVER} "
            aws ecr get-login-password --region ${AWS_REGION} | \
            docker login --username AWS --password-stdin ${ECR} &&

            docker pull ${ECR}/${IMAGE_NAME}:${IMAGE_TAG} &&

            trivy image --exit-code 1 --severity HIGH,CRITICAL \
            ${ECR}/${IMAGE_NAME}:${IMAGE_TAG}
          "
        """
      }
    }

    stage('Update Helm Repo (GitOps Trigger)') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'github-creds',
          usernameVariable: 'GIT_USERNAME',
          passwordVariable: 'GIT_TOKEN'
        )]) {
          sh """
            rm -rf ihms-deploy

            git clone https://${GIT_USERNAME}:${GIT_TOKEN}@github.com/bk-thakur/ihms-deploy.git
            cd ihms-deploy/environments/dev

            sed -i "s/tag:.*/tag: ${IMAGE_TAG}/" values.yaml

            git config user.email "ci@ihms.com"
            git config user.name "ci-bot"

            git add values.yaml
            git commit -m "Update image tag to ${IMAGE_TAG}" || echo "No changes to commit"

            git push origin main
          """
        }
      }
    }

  }

  post {
    success {
      echo "Pipeline completed successfully 🚀"
    }
    failure {
      echo "Pipeline failed due to quality or security issue ❌"
    }
  }
}
